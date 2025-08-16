import * as L from 'leaflet';
import { TileManifest } from './types.js';

interface CustomTileLayerOptions extends L.TileLayerOptions {
  maxNativeZoom?: number;
  detectRetina?: boolean;
  tms?: boolean;
}

export class TileLayerManager {
  private map: L.Map;
  public currentLayer: L.TileLayer | null;
  private manifest: TileManifest | null;

  constructor(map: L.Map) {
    this.map = map;
    this.currentLayer = null;
    this.manifest = null;
  }

  async initializeTileLayer(): Promise<void> {
    try {
      const response = await fetch('assets/tiles/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      }
      this.manifest = await response.json();
      if (this.manifest) {
        this.setupTileLayerWithManifest(this.manifest);
      } else {
        throw new Error('Invalid manifest data');
      }
    } catch (error) {
      console.warn('Failed to load manifest.json, using fallback configuration', error);
      this.setupFallbackTileLayer();
    }
  }

  private setupTileLayerWithManifest(manifest: TileManifest): void {
    const avail = Array.isArray((manifest as any).availableZooms) && (manifest as any).availableZooms.length ? 
                  (manifest as any).availableZooms : null;
    const minNativeZoom = avail ? Math.min(...avail) : 0;
    const maxNativeZoom = avail ? Math.max(...avail) : manifest.maxZoom || 14;
    
    // Allow zooming beyond native zoom level but limit excessive zooming
    const displayMaxZoom = Math.min(maxNativeZoom + 3, 18);

    this.map.setMinZoom(manifest.minZoom || minNativeZoom);
    this.map.setMaxZoom(displayMaxZoom);

    if (manifest.bounds) {
      this.map.fitBounds(L.latLngBounds(manifest.bounds[0], manifest.bounds[1]));
    } else {
      // Fallback if no bounds in manifest
      this.map.setView(manifest.center || [-41.5, 174.0], 8);
    }

    // Create custom tile layer
    const layer = L.tileLayer('assets/tiles/{z}/{x}/{y}.png', {
      minZoom: this.map.getMinZoom(),
      maxZoom: displayMaxZoom,
      maxNativeZoom: maxNativeZoom,
      tileSize: manifest.tileSize || 256,
      detectRetina: false,
      tms: false,
      attribution: manifest.attribution || 'NZ Topos by XCAOX',
      errorTileUrl: 'assets/tiles/default.png'  // Built-in Leaflet option for error tiles
    });

    this.currentLayer = layer;
    layer.addTo(this.map);
  }

  private setupFallbackTileLayer(): void {
    // Fallback: Configure proper overzooming behavior
    const maxNativeZoom = 14;
    const displayMaxZoom = Math.min(maxNativeZoom + 3, 18);
    
    this.map.setMaxZoom(displayMaxZoom);
    
    // Set initial view for New Zealand (fallback center and zoom)
    this.map.setView([-41.5, 174.0], 8);
    
    const layer = L.tileLayer('assets/tiles/{z}/{x}/{y}.png', {
      tileSize: 256,
      tms: false,
      maxNativeZoom: maxNativeZoom,
      maxZoom: displayMaxZoom,
      detectRetina: false,
      attribution: 'NZ Topos by XCAOX',
      errorTileUrl: 'assets/tiles/default.png'
    });
    
    this.currentLayer = layer;
    layer.addTo(this.map);
  }

  restoreBounds(): void {
    if (this.manifest && this.manifest.bounds) {
      this.map.fitBounds(L.latLngBounds(this.manifest.bounds[0], this.manifest.bounds[1]));
    } else {
      // Fallback to reasonable New Zealand bounds
      this.map.setView([-41.5, 174.0], 8);
    }
  }

  getManifest(): TileManifest | null {
    return this.manifest;
  }
}
