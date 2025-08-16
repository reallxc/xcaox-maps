import { POI, Path, Area } from './types.js';

export class DataService {
  private basePath: string;

  constructor(basePath: string = 'src') {
    this.basePath = basePath;
  }

  async fetchPOIs(): Promise<POI[]> {
    try {
      const response = await fetch(`${this.basePath}/data/pois.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch POIs: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching POIs:', error);
      return [];
    }
  }

  async fetchPaths(): Promise<Path[]> {
    try {
      const response = await fetch(`${this.basePath}/data/paths.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch paths: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching paths:', error);
      return [];
    }
  }

  async fetchAreas(): Promise<Area[]> {
    try {
      const response = await fetch(`${this.basePath}/data/areas.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch areas: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }
}
