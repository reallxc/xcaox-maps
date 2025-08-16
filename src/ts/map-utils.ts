import * as L from 'leaflet';
import { Path, Area, POI } from './types.js';

export interface MarkerOptions {
  latitude: number;
  longitude: number;
  iconUrl?: string;
  popupContent?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
}

export interface PathOptions {
  color?: string;
  weight?: number;
  opacity?: number;
}

export interface AreaOptions {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  opacity?: number;
}

export class MapUtils {
  static addMarker(map: L.Map, options: MarkerOptions): L.Marker {
    const { latitude, longitude, iconUrl, popupContent, iconSize, iconAnchor } = options;
    
    const marker = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: iconUrl || 'assets/icons/poi-marker.svg',
        iconSize: iconSize || [25, 41],
        iconAnchor: iconAnchor || [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map);

    if (popupContent) {
      marker.bindPopup(popupContent);
    }

    return marker;
  }

  static drawPath(map: L.Map, coordinates: [number, number][], options: PathOptions = {}): L.Polyline {
    const path = L.polyline(coordinates, {
      color: options.color || 'blue',
      weight: options.weight || 5,
      opacity: options.opacity || 0.7
    }).addTo(map);

    return path;
  }

  static highlightArea(map: L.Map, coordinates: [number, number][], options: AreaOptions = {}): L.Polygon {
    const area = L.polygon(coordinates, {
      color: options.color || 'red',
      fillColor: options.fillColor || 'red',
      fillOpacity: options.fillOpacity || 0.5,
      weight: options.weight || 2,
      opacity: options.opacity || 0.8
    }).addTo(map);

    return area;
  }

  static createPathFromData(map: L.Map, pathData: Path): L.Polyline {
    const coordinates: [number, number][] = pathData.coordinates.map(coord => [coord.lat, coord.lng]);
    const options: PathOptions = {
      color: pathData.style?.color || 'blue',
      weight: pathData.style?.weight || 3,
      opacity: pathData.style?.opacity || 0.7
    };

    const path = this.drawPath(map, coordinates, options);
    
    if (pathData.description) {
      path.bindPopup(`<b>${pathData.name}</b><br>${pathData.description}`);
    }

    return path;
  }

  static createAreaFromData(map: L.Map, areaData: Area): L.Polygon {
    // Area coordinates are arrays of coordinate arrays (for polygons with holes)
    const coordinates: [number, number][][] = areaData.coordinates.map(ring => 
      ring.map(coord => [coord.lat, coord.lng])
    );

    const options: AreaOptions = {
      color: areaData.style?.color || 'red',
      fillColor: areaData.style?.fillColor || 'red',
      fillOpacity: areaData.style?.fillOpacity || 0.3,
      weight: areaData.style?.weight || 2,
      opacity: areaData.style?.opacity || 0.8
    };

    const area = L.polygon(coordinates, options).addTo(map);
    
    if (areaData.description) {
      area.bindPopup(`<b>${areaData.name}</b><br>${areaData.description}`);
    }

    return area;
  }

  static fitMapToFeatures(map: L.Map, features: (L.Marker | L.Polyline | L.Polygon)[]): void {
    if (features.length === 0) return;

    const group = new L.FeatureGroup(features);
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  }

  static calculateDistance(point1: [number, number], point2: [number, number]): number {
    const latlng1 = L.latLng(point1[0], point1[1]);
    const latlng2 = L.latLng(point2[0], point2[1]);
    return latlng1.distanceTo(latlng2);
  }

  static formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  static addMarkerFromPOI(map: L.Map, poi: POI): L.Marker {
    return this.addMarker(map, {
      latitude: poi.latitude,
      longitude: poi.longitude,
      iconUrl: poi.icon,
      popupContent: poi.description ? `<b>${poi.name}</b><br>${poi.description}` : `<b>${poi.name}</b>`
    });
  }
}
