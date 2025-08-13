class POIManager {
    constructor(map) {
        this.map = map;
        this.poiLayer = L.layerGroup().addTo(map);
        this.pois = [];
    }

    async loadPOIs(dataService) {
        this.pois = await dataService.fetchPOIs();
        this.displayPOIs();
    }

    displayPOIs() {
        this.poiLayer.clearLayers();
        this.pois.forEach(poi => {
            const marker = L.marker([poi.latitude, poi.longitude], {
                icon: L.icon({
                    iconUrl: 'assets/icons/poi-marker.svg',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                })
            }).addTo(this.poiLayer);

            marker.bindPopup(`<b>${poi.name}</b><br>${poi.description}`);
        });
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

export default POIManager;