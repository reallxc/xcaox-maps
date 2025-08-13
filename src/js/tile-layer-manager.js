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
    
    // Allow zooming beyond native zoom level but limit excessive zooming
    const displayMaxZoom = Math.min(maxNativeZoom + 3, 18); // Allow max 3 levels of overzooming

    this.map.setMinZoom(minNativeZoom);
    this.map.setMaxZoom(displayMaxZoom);

    if (manifest.bounds) {
      this.map.fitBounds(L.latLngBounds(manifest.bounds[0], manifest.bounds[1]));
    }

    // Create custom tile layer
    const layer = new this.CustomTileLayer('assets/tiles/{z}/{x}/{y}.png', {
      minZoom: this.map.getMinZoom(),
      maxZoom: displayMaxZoom,
      maxNativeZoom: maxNativeZoom,   // This tells Leaflet to scale z=13 tiles for higher zooms
      tileSize: 256,
      detectRetina: false,  // Disable retina to prevent fetching @2x tiles that don't exist
      tms: false,
      attribution: 'NZ Topos by XCAOX',
    });

    layer.addTo(this.map);
  }

  setupFallbackTileLayer() {
    // Fallback: Configure proper overzooming behavior
    const maxNativeZoom = 13;
    const displayMaxZoom = Math.min(maxNativeZoom + 3, 18); // Allow max 3 levels of overzooming
    
    this.map.setMaxZoom(displayMaxZoom);
    
    L.tileLayer('assets/tiles/{z}/{x}/{y}.png', {
      tileSize: 256,
      tms: false,
      maxNativeZoom: maxNativeZoom,  // This is the key - tells Leaflet to scale z=13 tiles
      maxZoom: displayMaxZoom,
      detectRetina: false,  // Disable retina to prevent fetching @2x tiles
      attribution: 'NZ Topos by XCAOX'
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

// Make TileLayerManager globally available
window.TileLayerManager = TileLayerManager;
