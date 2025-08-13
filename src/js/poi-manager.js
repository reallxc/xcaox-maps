class POIManager {
    constructor(map) {
        this.map = map;
        this.poiLayer = L.layerGroup().addTo(map);
        this.pois = [];
    }

    loadPOIs(poisData) {
        console.log('POIManager: Loading POIs data:', poisData);
        this.pois = poisData;
        this.displayPOIs();
    }

    displayPOIs() {
        console.log('POIManager: Displaying POIs, count:', this.pois.length);
        this.poiLayer.clearLayers();
        this.pois.forEach(poi => {
            console.log('Creating marker for POI:', poi.name, 'at', poi.latitude, poi.longitude);
            const marker = L.marker([poi.latitude, poi.longitude], {
                icon: L.icon({
                    iconUrl: 'assets/icons/poi-marker.svg',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                })
            }).addTo(this.poiLayer);

            marker.bindPopup(`<b>${poi.name}</b><br>${poi.description}`);
        });
        console.log('POIManager: All markers created');
    }

    addPOI(poi) {
        this.pois.push(poi);
        this.displayPOIs();
    }

    removePOI(poiId) {
        this.pois = this.pois.filter(poi => poi.id !== poiId);
        this.displayPOIs();
    }
}

// Remove ES6 export and make it globally available
window.POIManager = POIManager;