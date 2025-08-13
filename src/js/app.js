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

    // Initialize data services and POI management
    this.dataService = new DataService();
    this.poiManager = new POIManager(this.map);

    // Load POIs
    this.loadPOIs();
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