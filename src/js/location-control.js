/**
 * Custom Location Control for Leaflet Map
 */
class LocationControl {
  constructor(map) {
    this.map = map;
    this.userMarker = null;
    this.accuracyCircle = null;
    this.init();
  }

  init() {
    // Create and add the locate control
    const LocateControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: (map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        const link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Locate me';
        link.setAttribute('aria-label', 'Locate me');
        link.style.width = '35px';
        link.style.height = '35px';
        link.style.lineHeight = '35px';
        link.style.textAlign = 'center';
        link.style.fontSize = '18px';
        link.textContent = '📍';

        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', () => this.triggerLocate());
        return container;
      }
    });
    
    this.map.addControl(new LocateControl());
  }

  triggerLocate() {
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
    
    this.map.once('locationfound', (e) => this.onLocationFound(e));
    this.map.once('locationerror', (e) => alert('Location error: ' + e.message));
    this.map.locate({ 
      setView: true, 
      maxZoom: Math.min(15, this.map.getMaxZoom()), 
      enableHighAccuracy: true, 
      timeout: 10000 
    });
  }

  onLocationFound(e) {
    const { latlng, accuracy } = e;
    
    if (!this.userMarker) {
      this.userMarker = L.marker(latlng, { title: 'Your location' }).addTo(this.map);
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
  }

  showGeoNotice() {
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
    setTimeout(() => div.remove(), 8000);
  }
}

// Show notice immediately on load if insecure
(function checkSecureOrigin() {
  const insecure = location.protocol !== 'https:' && 
                  location.hostname !== 'localhost' && 
                  location.hostname !== '127.0.0.1';
  if (insecure) {
    const locationControl = new LocationControl();
    locationControl.showGeoNotice();
  }
})();
