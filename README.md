# Leaflet POI System

This project implements a Points of Interest (POI) system using Leaflet, a popular JavaScript library for interactive maps. The system fetches and displays POIs, paths, and areas on the map, providing users with an engaging way to explore geographical data.

## Project Structure

```
leaflet-poi-system
├── src
│   ├── js
│   │   ├── app.js            # Main entry point for the application
│   │   ├── poi-manager.js     # Handles loading and management of POIs
│   │   ├── data-service.js    # Fetches data from JSON files
│   │   └── map-utils.js       # Utility functions for map-related tasks
│   ├── css
│   │   └── styles.css         # Styles for the application
│   └── data
│       ├── pois.json          # Contains POI data
│       ├── paths.json         # Contains path data
│       └── areas.json         # Contains area data
├── assets
│   └── icons
│       ├── poi-marker.svg     # Icon for POIs
│       ├── path-marker.svg    # Icon for paths
│       └── area-marker.svg    # Icon for areas
├── index.html                 # Main HTML file
├── package.json               # npm configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd leaflet-poi-system
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   Open `index.html` in a web browser to view the map and interact with the POIs.

## Usage

- The map will display various Points of Interest (POIs) fetched from `pois.json`.
- Paths and areas can also be displayed, providing additional context and information.
- Users can interact with the map to explore different locations and view details about each POI.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.