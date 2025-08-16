import * as L from 'leaflet';
import { DataService } from './data-service.js';
import { POIManager } from './poi-manager.js';
import { LocationControl, checkSecureOrigin } from './location-control.js';
import { TileLayerManager } from './tile-layer-manager.js';
import { LayerType, LayerSwitchEvent, POI, MapAppConfig } from './types.js';

export class MapApp {
  private map: L.Map | null;
  private dataService: DataService | null;
  private poiManager: POIManager | null;
  private locationControl: LocationControl | null;
  private tileLayerManager: TileLayerManager | null;
  private localTileLayer: L.TileLayer | null;
  private osmTileLayer: L.TileLayer | null;
  private currentLayer: LayerType;

  constructor() {
    this.map = null;
    this.dataService = null;
    this.poiManager = null;
    this.locationControl = null;
    this.tileLayerManager = null;
    this.localTileLayer = null;
    this.osmTileLayer = null;
    this.currentLayer = 'local';
  }

  async init(config: MapAppConfig = {}): Promise<void> {
    try {
      // Initialize map with basic settings - we'll set proper bounds after loading manifest
      this.map = L.map('map', { 
        preferCanvas: config.preferCanvas ?? true,
        zoomControl: config.zoomControl ?? false,
        attributionControl: config.attributionControl ?? true
      });

      // Add zoom control at bottom left
      L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

      // Initialize components
      this.locationControl = new LocationControl(this.map);
      this.tileLayerManager = new TileLayerManager(this.map);
      
      // Setup tile layer first, which will set proper bounds
      await this.tileLayerManager.initializeTileLayer();

      // Store reference to the local tile layer
      this.localTileLayer = this.tileLayerManager.currentLayer;

      // Create OpenStreetMap layer (but don't add it yet)
      this.osmTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      });

      // Add layer switching control
      this.addLayerSwitchControl();

      // Initialize data services and POI management
      this.dataService = new DataService();
      this.poiManager = new POIManager(this.map);

      // Load POIs
      await this.loadPOIs();

      console.log('🗺️ Map application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize map application:', error);
      throw error;
    }
  }

  private addLayerSwitchControl(): void {
    if (!this.map) return;

    // Create custom layer switch control
    const LayerSwitchControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        
        button.href = '#';
        button.title = 'Switch to OpenStreetMap';
        button.setAttribute('aria-label', 'Switch map layer');
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.lineHeight = '40px';
        button.style.textAlign = 'center';
        button.style.fontSize = '18px';
        button.style.backgroundColor = '#fff';
        button.textContent = '🗺️';

        L.DomEvent.on(button, 'click', L.DomEvent.stop)
                  .on(button, 'click', () => this.switchLayer(button));
        
        return container;
      }
    });
    
    this.map.addControl(new LayerSwitchControl());
  }

  private switchLayer(button: HTMLAnchorElement): void {
    if (!this.map) return;

    // Save current map view
    const currentCenter = this.map.getCenter();
    const currentZoom = this.map.getZoom();
    
    const fromLayer = this.currentLayer;
    let toLayer: LayerType;
    
    if (this.currentLayer === 'local') {
      // Switch to OpenStreetMap
      if (this.localTileLayer) {
        this.map.removeLayer(this.localTileLayer);
      }
      if (this.osmTileLayer) {
        this.osmTileLayer.addTo(this.map);
      }
      toLayer = 'osm';
      button.textContent = '🏠';
      button.title = 'Switch to Local Map';
      
      // Update max zoom for OSM but preserve current view
      this.map.setMaxZoom(19);
      
    } else {
      // Switch back to local tiles
      if (this.osmTileLayer) {
        this.map.removeLayer(this.osmTileLayer);
      }
      if (this.localTileLayer) {
        this.localTileLayer.addTo(this.map);
      }
      toLayer = 'local';
      button.textContent = '🗺️';
      button.title = 'Switch to OpenStreetMap';
      
      // Restore local tile max zoom settings
      const manifest = this.tileLayerManager?.getManifest();
      const maxNativeZoom = manifest?.maxZoom || 14;
      const displayMaxZoom = Math.min(maxNativeZoom + 3, 18);
      this.map.setMaxZoom(displayMaxZoom);
    }
    
    this.currentLayer = toLayer;
    
    // Restore the exact same view position and zoom
    this.map.setView(currentCenter, currentZoom);

    // Emit layer switch event
    const event: LayerSwitchEvent = {
      from: fromLayer,
      to: toLayer,
      center: currentCenter,
      zoom: currentZoom
    };
    
    console.log('Layer switched:', event);
    // You can emit custom events here if needed
    // this.map.fire('layer:switch', event);
  }

  private async loadPOIs(): Promise<void> {
    if (!this.dataService || !this.poiManager) {
      console.error('DataService or POIManager not initialized');
      return;
    }

    console.log('=== POI LOADING DEBUG ===');
    console.log('Starting to load POIs...');
    console.log('Map object:', this.map);
    console.log('POI Manager object:', this.poiManager);
    console.log('Data Service object:', this.dataService);
    
    try {
      console.log('Attempting to fetch real POI data...');
      const pois = await this.dataService.fetchPOIs();
      console.log('Real POIs loaded from file:', pois);
      
      if (pois && pois.length > 0) {
        this.poiManager.loadPOIs(pois);
        console.log('Real POIs loaded into manager');
      } else {
        console.log('No POIs found in data file');
      }
    } catch (error) {
      console.error('Error loading real POIs:', error);
    }
    
    console.log('=== END POI LOADING DEBUG ===');
  }

  // Public API methods
  public getMap(): L.Map | null {
    return this.map;
  }

  public getCurrentLayer(): LayerType {
    return this.currentLayer;
  }

  public addPOI(poi: POI): void {
    if (this.poiManager) {
      this.poiManager.addPOI(poi);
    }
  }

  public removePOI(poiId: string | number): void {
    if (this.poiManager) {
      this.poiManager.removePOI(poiId);
    }
  }

  public getAllPOIs(): POI[] {
    return this.poiManager?.getAllPOIs() || [];
  }

  public fitToBounds(): void {
    if (this.tileLayerManager) {
      this.tileLayerManager.restoreBounds();
    }
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.dataService = null;
    this.poiManager = null;
    this.locationControl = null;
    this.tileLayerManager = null;
    this.localTileLayer = null;
    this.osmTileLayer = null;
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MapApp();
  app.init().catch(error => {
    console.error('Failed to initialize map application:', error);
  });

  // Make app globally available for debugging
  (window as any).mapApp = app;
});

// Check secure origin for geolocation
checkSecureOrigin();
