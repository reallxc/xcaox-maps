/**
 * Main Map Application
 */
class MapApp {
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

  async init() {
    // Initialize map with basic settings - we'll set proper bounds after loading manifest
    this.map = L.map('map', { 
      preferCanvas: true,
      zoomControl: false, // Disable default zoom control
      // attributionControl: false
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
    this.loadPOIs();
  }

  addLayerSwitchControl() {
    // Create custom layer switch control
    const LayerSwitchControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: (map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        
        button.href = '#';
        button.title = 'Switch to OpenStreetMap';
        button.setAttribute('aria-label', 'Switch map layer');
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.lineHeight = '40px';
        button.style.textAlign = 'center';
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#fff';
        button.textContent = '🗺️';

        L.DomEvent.on(button, 'click', L.DomEvent.stop)
                  .on(button, 'click', () => this.switchLayer(button));
        
        return container;
      }
    });
    
    this.map.addControl(new LayerSwitchControl());
  }

  switchLayer(button) {
    // Save current map view
    const currentCenter = this.map.getCenter();
    const currentZoom = this.map.getZoom();
    
    if (this.currentLayer === 'local') {
      // Switch to OpenStreetMap
      if (this.localTileLayer) {
        this.map.removeLayer(this.localTileLayer);
      }
      this.osmTileLayer.addTo(this.map);
      this.currentLayer = 'osm';
      button.textContent = '🏠';
      button.title = 'Switch to Local Map';
      
      // Update max zoom for OSM but preserve current view
      this.map.setMaxZoom(19);
      
    } else {
      // Switch back to local tiles
      this.map.removeLayer(this.osmTileLayer);
      if (this.localTileLayer) {
        this.localTileLayer.addTo(this.map);
      }
      this.currentLayer = 'local';
      button.textContent = '🗺️';
      button.title = 'Switch to OpenStreetMap';
      
      // Restore local tile max zoom settings
      const maxNativeZoom = 13;
      const displayMaxZoom = Math.min(maxNativeZoom + 3, 18);
      this.map.setMaxZoom(displayMaxZoom);
    }
    
    // Restore the exact same view position and zoom
    this.map.setView(currentCenter, currentZoom);
  }

  loadPOIs() {
    console.log('=== POI LOADING DEBUG ===');
    console.log('Starting to load POIs...');
    console.log('Map object:', this.map);
    console.log('POI Manager object:', this.poiManager);
    console.log('Data Service object:', this.dataService);
    
    // Also try the real data fetch
    console.log('Attempting to fetch real POI data...');
    this.dataService.fetchPOIs().then(pois => {
      console.log('Real POIs loaded from file:', pois);
      if (pois && pois.length > 0) {
        this.poiManager.loadPOIs(pois);
        console.log('Real POIs loaded into manager');
      }
    }).catch(error => {
      console.error('Error loading real POIs:', error);
    });
    
    console.log('=== END POI LOADING DEBUG ===');
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MapApp();
  app.init().catch(error => {
    console.error('Failed to initialize map application:', error);
  });
});