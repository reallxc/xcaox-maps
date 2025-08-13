const L = require('leaflet');

export function addMarker(map, { latitude, longitude, iconUrl, popupContent }) {
    const marker = L.marker([latitude, longitude], {
        icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    if (popupContent) {
        marker.bindPopup(popupContent);
    }

    return marker;
}

export function drawPath(map, coordinates, options = {}) {
    const path = L.polyline(coordinates, {
        color: options.color || 'blue',
        weight: options.weight || 5,
        opacity: options.opacity || 0.7
    }).addTo(map);

    return path;
}

export function highlightArea(map, coordinates, options = {}) {
    const area = L.polygon(coordinates, {
        color: options.color || 'red',
        fillColor: options.fillColor || 'red',
        fillOpacity: options.fillOpacity || 0.5
    }).addTo(map);

    return area;
}