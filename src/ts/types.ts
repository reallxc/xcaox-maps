import * as L from 'leaflet';

// POI Types
export interface POI {
  id: string | number;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  description?: string;
  icon?: string;
  category?: string;
}

// Path Types
export interface PathPoint {
  lat: number;
  lng: number;
}

export interface Path {
  id: string;
  name: string;
  type: string;
  coordinates: PathPoint[];
  description?: string;
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
  };
}

// Area Types
export interface Area {
  id: string;
  name: string;
  type: string;
  coordinates: PathPoint[][];
  description?: string;
  style?: {
    color?: string;
    fillColor?: string;
    weight?: number;
    opacity?: number;
    fillOpacity?: number;
  };
}

// Tile Manifest Types
export interface TileManifest {
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  center: [number, number]; // [lat, lng]
  minZoom: number;
  maxZoom: number;
  tileSize: number;
  format: string;
  attribution?: string;
}

// Layer Types
export type LayerType = 'local' | 'osm';

// Map Application Types
export interface MapAppConfig {
  preferCanvas?: boolean;
  zoomControl?: boolean;
  attributionControl?: boolean;
}

// Custom Control Types
export interface CustomControlOptions extends L.ControlOptions {
  position: L.ControlPosition;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Debug Types
export interface DebugInfo {
  mapCenter: L.LatLng;
  mapZoom: number;
  currentLayer: LayerType;
  activePOIs: number;
  timestamp: string;
}

// Event Types
export interface LayerSwitchEvent {
  from: LayerType;
  to: LayerType;
  center: L.LatLng;
  zoom: number;
}

export interface POIClickEvent {
  poi: POI;
  marker: L.Marker;
  latlng: L.LatLng;
}
