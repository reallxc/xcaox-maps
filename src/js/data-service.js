class DataService {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async fetchPOIs() {
    try {
      const response = await fetch(`${this.basePath}/data/pois.json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching POIs:', error);
      return [];
    }
  }

  async fetchPaths() {
    try {
      const response = await fetch(`${this.basePath}/data/paths.json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching paths:', error);
      return [];
    }
  }

  async fetchAreas() {
    try {
      const response = await fetch(`${this.basePath}/data/areas.json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }
}

export default DataService;