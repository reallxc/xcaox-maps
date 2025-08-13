/**
 * Custom Tile Layer Manager for handling missing tiles
 */
class TileLayerManager {
  constructor(map) {
    this.map = map;
  }

  async initializeTileLayer() {
    try {
      const manifest = await fetch('assets/tiles/manifest.json').then(r => r.json());
      this.setupTileLayerWithManifest(manifest);
    } catch (error) {
      console.warn('Failed to load manifest.json, using fallback configuration');
      this.setupFallbackTileLayer();
    }
  }

  setupTileLayerWithManifest(manifest) {
    const avail = Array.isArray(manifest.availableZooms) && manifest.availableZooms.length ? 
                  manifest.availableZooms : null;
    const minNativeZoom = avail ? Math.min(...avail) : 0;
    const maxNativeZoom = avail ? Math.max(...avail) : 13; // your highest tile zoom
    const displayMaxZoom = Math.max(15, maxNativeZoom);     // allow overzoom to 15

    this.map.setMinZoom(minNativeZoom);
    this.map.setMaxZoom(displayMaxZoom);

    if (manifest.bounds) {
      this.map.fitBounds(L.latLngBounds(manifest.bounds[0], manifest.bounds[1]));
    }

    // Create custom tile layer
    const layer = new this.CustomTileLayer('assets/tiles/{z}/{x}/{y}.png', {
      minZoom: this.map.getMinZoom(),
      maxZoom: displayMaxZoom,
      maxNativeZoom: maxNativeZoom,   // scale z=13 tiles for higher zooms
      tileSize: 256,
      detectRetina: true,
      tms: false,
      attribution: 'NZ Topos by XCAOX',
    });

    layer.addTo(this.map);
  }

  setupFallbackTileLayer() {
    // Fallback: still try single tree with overzoom
    this.map.setMaxZoom(15);
    L.tileLayer('assets/tiles/{z}/{x}/{y}.png', {
      tileSize: 256,
      tms: false,
      maxNativeZoom: 13,
      maxZoom: 15
    }).addTo(this.map);
  }

  get CustomTileLayer() {
    return L.TileLayer.extend({
      createTile: function(coords, done) {
        const tile = document.createElement('img');
        
        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));
        
        if (this.options.crossOrigin || this.options.crossOrigin === '') {
          tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
        }
        
        tile.alt = '';
        tile.setAttribute('role', 'presentation');
        tile.src = this.getTileUrl(coords);
        
        return tile;
      },
      
      _tileOnError: function(done, tile, e) {
        // On error, load the default tile
        tile.src = 'assets/tiles/default.png';
        // Remove the error event listener to prevent infinite loops
        L.DomEvent.off(tile, 'error', this._tileOnError, this);
        // Add a one-time load listener for the default tile
        L.DomEvent.on(tile, 'load', function() {
          done(null, tile);
        });
      }
    });
  }
}
