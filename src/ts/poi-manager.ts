import * as L from 'leaflet';
import { POI, POIClickEvent } from './types.js';

export class POIManager {
  private map: L.Map;
  private poiLayer: L.LayerGroup;
  private pois: POI[];
  private markers: Map<string, L.Marker>;

  constructor(map: L.Map) {
    this.map = map;
    this.poiLayer = L.layerGroup().addTo(map);
    this.pois = [];
    this.markers = new Map();
  }

  loadPOIs(poisData: POI[]): void {
    console.log('POIManager: Loading POIs data:', poisData);
    this.pois = poisData;
    this.displayPOIs();
  }

  displayPOIs(): void {
    console.log('POIManager: Displaying POIs, count:', this.pois.length);
    this.poiLayer.clearLayers();
    this.markers.clear();

    this.pois.forEach(poi => {
      this.createMarkerForPOI(poi);
    });
    
    console.log('POIManager: All markers created');
  }

  private createMarkerForPOI(poi: POI): void {
    console.log('Creating marker for POI:', poi.name, 'at', poi.latitude, poi.longitude);
    
    const lat = poi.latitude;
    const lng = poi.longitude;
    const iconUrl = poi.icon || 'assets/icons/poi-marker.svg';
    
    const marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
    }).addTo(this.poiLayer);

    const popupContent = this.createPopupContent(poi);
    marker.bindPopup(popupContent);

    // Store marker reference
    this.markers.set(String(poi.id), marker);

    // Add click event
    marker.on('click', (e: L.LeafletMouseEvent) => {
      this.onPOIClick(poi, marker, e.latlng);
    });
  }

  private createPopupContent(poi: POI): string {
    const description = poi.description || '';
    const category = poi.category ? `<br><i>Category: ${poi.category}</i>` : '';
    return `<b>${poi.name}</b><br>${description}${category}`;
  }

  private onPOIClick(poi: POI, marker: L.Marker, latlng: L.LatLng): void {
    const event: POIClickEvent = { poi, marker, latlng };
    console.log('POI clicked:', event);
    
    // You can emit custom events here if needed
    // this.map.fire('poi:click', event);
  }

  addPOI(poi: POI): void {
    this.pois.push(poi);
    this.createMarkerForPOI(poi);
  }

  removePOI(poiId: string | number): void {
    // Remove from array
    this.pois = this.pois.filter(poi => poi.id !== poiId);
    
    // Remove marker
    const marker = this.markers.get(String(poiId));
    if (marker) {
      this.poiLayer.removeLayer(marker);
      this.markers.delete(String(poiId));
    }
  }

  getPOIById(poiId: string | number): POI | undefined {
    return this.pois.find(poi => poi.id === poiId);
  }

  getAllPOIs(): POI[] {
    return [...this.pois]; // Return copy to prevent mutation
  }

  getMarkerById(poiId: string | number): L.Marker | undefined {
    return this.markers.get(String(poiId));
  }

  clear(): void {
    this.poiLayer.clearLayers();
    this.markers.clear();
    this.pois = [];
  }
}
