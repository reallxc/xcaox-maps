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
  }

  async init() {
    // Initialize map with basic settings
    this.map = L.map('map', { 
      preferCanvas: true,
      zoomControl: false, // Disable default zoom control
      // attributionControl: false
    }).setView([-41.5, 174.8], 6);

    // Add zoom control at bottom left
    L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

    // Initialize components
    this.locationControl = new LocationControl(this.map);
    this.tileLayerManager = new TileLayerManager(this.map);
    
    // Setup tile layer
    await this.tileLayerManager.initializeTileLayer();

    // Initialize data services and POI management
    this.dataService = new DataService();
    this.poiManager = new POIManager(this.map);

    // Load POIs
    this.loadPOIs();
  }

  loadPOIs() {
    this.dataService.fetchPOIs().then(pois => {
      this.poiManager.loadPOIs(pois);
    }).catch(error => {
      console.error('Error loading POIs:', error);
    });
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MapApp();
  app.init().catch(error => {
    console.error('Failed to initialize map application:', error);
  });
});