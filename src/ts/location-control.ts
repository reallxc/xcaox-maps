import * as L from 'leaflet';
import { LocationData, GeolocationError } from './types.js';

export class LocationControl {
  private map: L.Map;
  private userMarker: L.Marker | null;
  private accuracyCircle: L.Circle | null;

  constructor(map: L.Map) {
    this.map = map;
    this.userMarker = null;
    this.accuracyCircle = null;
    this.init();
  }

  private init(): void {
    // Create and add the locate control
    const LocateControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        const link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Locate me';
        link.setAttribute('aria-label', 'Locate me');
        link.style.width = '40px';
        link.style.height = '40px';
        link.style.lineHeight = '40px';
        link.style.textAlign = 'center';
        link.style.fontSize = '20px';
        link.textContent = '📍';

        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', () => this.triggerLocate());
        return container;
      }
    });
    
    this.map.addControl(new LocateControl());
  }

  private triggerLocate(): void {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported on this device/browser.');
      return;
    }
    
    const insecure = location.protocol !== 'https:' && 
                    location.hostname !== 'localhost' && 
                    location.hostname !== '127.0.0.1';
    
    if (insecure) {
      console.warn('Tip: Mobile browsers often require HTTPS for geolocation. Use https or localhost.');
      this.showGeoNotice();
    }
    
    this.map.once('locationfound', (e: L.LocationEvent) => this.onLocationFound(e));
    this.map.once('locationerror', (e: L.ErrorEvent) => this.onLocationError(e));
    
    this.map.locate({ 
      setView: true, 
      maxZoom: Math.min(15, this.map.getMaxZoom()), 
      enableHighAccuracy: true, 
      timeout: 10000 
    });
  }

  private onLocationFound(e: L.LocationEvent): void {
    const { latlng, accuracy } = e;
    
    if (!this.userMarker) {
      this.userMarker = L.marker(latlng, { 
        title: 'Your location',
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iIzEzNkFFQyIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      }).addTo(this.map);
    } else {
      this.userMarker.setLatLng(latlng);
    }
    
    if (!this.accuracyCircle) {
      this.accuracyCircle = L.circle(latlng, { 
        radius: accuracy, 
        color: '#136AEC', 
        weight: 2, 
        opacity: 0.6, 
        fillColor: '#136AEC', 
        fillOpacity: 0.15 
      }).addTo(this.map);
    } else {
      this.accuracyCircle.setLatLng(latlng);
      this.accuracyCircle.setRadius(accuracy);
    }

    // Create location data object
    const locationData: LocationData = {
      latitude: latlng.lat,
      longitude: latlng.lng,
      accuracy: accuracy,
      timestamp: Date.now()
    };

    console.log('Location found:', locationData);
  }

  private onLocationError(e: L.ErrorEvent): void {
    const error: GeolocationError = {
      code: e.code || 0,
      message: e.message
    };
    
    console.error('Location error:', error);
    alert('Location error: ' + error.message);
  }

  showGeoNotice(): void {
    if (document.getElementById('geo-notice')) return;
    
    const div = document.createElement('div');
    div.id = 'geo-notice';
    div.className = 'geo-notice';
    div.innerHTML = 'Geolocation needs HTTPS (or localhost). On iOS, HTTP over local Wi‑Fi is blocked.';
    
    const btn = document.createElement('button');
    btn.textContent = 'Dismiss';
    btn.onclick = () => div.remove();
    div.appendChild(btn);
    document.body.appendChild(div);
    
    // Auto-hide after 8s
    setTimeout(() => {
      if (div.parentNode) {
        div.remove();
      }
    }, 8000);
  }

  public getCurrentLocation(): LocationData | null {
    if (!this.userMarker) return null;
    
    const latlng = this.userMarker.getLatLng();
    return {
      latitude: latlng.lat,
      longitude: latlng.lng,
      accuracy: this.accuracyCircle?.getRadius() || 0,
      timestamp: Date.now()
    };
  }

  public clearLocation(): void {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
      this.userMarker = null;
    }
    
    if (this.accuracyCircle) {
      this.map.removeLayer(this.accuracyCircle);
      this.accuracyCircle = null;
    }
  }
}

// Show notice immediately on load if insecure
export function checkSecureOrigin(): void {
  const insecure = location.protocol !== 'https:' && 
                  location.hostname !== 'localhost' && 
                  location.hostname !== '127.0.0.1';
  if (insecure) {
    // We'll create a temporary instance just to show the notice
    const tempControl = Object.create(LocationControl.prototype);
    tempControl.showGeoNotice();
  }
}
