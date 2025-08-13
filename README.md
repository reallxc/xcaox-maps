# 🗺️ XCAOX Maps

An interactive mapping platform built with Leaflet.js, featuring Points of Interest (POI) management, custom tile layers, and seamless layer switching between local tiles and OpenStreetMap.

## ✨ Features

- 🗺️ **Dual Layer Support**: Switch between custom local tiles and OpenStreetMap
- 📍 **POI Management**: Display and manage Points of Interest with custom markers
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Geolocation**: Find your current location with accuracy indicators
- 🔄 **Smooth Layer Switching**: Preserve view position when switching map layers
- ⚡ **High Performance**: Optimized tile loading with fallback handling
- 🎨 **Custom Styling**: Consistent UI design with custom controls

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install --production
npm start
```

## 📦 Deployment

### Prerequisites
- Node.js 16+ 
- Ubuntu 20.04+ server
- PM2 for process management
- Nginx for reverse proxy

### Deploy to Ubuntu Server

1. **Install dependencies on server:**
   ```bash
   sudo apt update
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Deploy application:**
   ```bash
   cd /var/www
   git clone <your-repo> xcaox-maps
   cd xcaox-maps
   npm install --production
   ```

3. **Start with PM2:**
   ```bash
   npm run pm2:start
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx** (see nginx.conf in docs/)

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server  
- `npm run pm2:start` - Start with PM2 (production)
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:restart` - Restart PM2 process
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monit` - Monitor with PM2

## 🏗️ Project Structure

```
xcaox-maps/
├── index.html              # Main HTML file
├── server.js              # Production Express server
├── ecosystem.config.js    # PM2 configuration
├── package.json           # Dependencies and scripts
├── assets/               # Static assets
│   ├── icons/           # Marker icons
│   └── tiles/           # Custom map tiles
└── src/                 # Source code
    ├── css/            # Stylesheets
    ├── js/             # JavaScript modules
    └── data/           # POI data files
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Tile Configuration
Custom tiles are configured in `assets/tiles/manifest.json`

### POI Data
POI data is stored in `src/data/pois.json`

## 📊 Monitoring

Access monitoring endpoints:
- Health check: `http://your-domain/health`  
- PM2 monitoring: `pm2 monit`
- Logs: `pm2 logs xcaox-maps`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes  
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details

## 🎯 Built With

- [Leaflet.js](https://leafletjs.com/) - Interactive maps
- [Express.js](https://expressjs.com/) - Web framework
- [PM2](https://pm2.keymetrics.io/) - Process manager
- Custom tile system for high-performance mapping

---

**XCAOX Maps** - Bringing interactive mapping to life! 🌍