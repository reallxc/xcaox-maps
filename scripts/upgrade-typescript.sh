#!/bin/bash

# Quick TypeScript Upgrade Script for XCAOX Maps
# For existing PM2 + Nginx deployments

set -e

echo "🚀 Starting TypeScript upgrade for XCAOX Maps..."

# Configuration (adjust these paths for your setup)
APP_DIR="${APP_DIR:-/var/www/xcaox-maps}"
APP_NAME="${APP_NAME:-xcaox-maps}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application directory $APP_DIR not found!"
    echo "Please set APP_DIR environment variable or update the script"
    exit 1
fi

# Check if PM2 app exists
if ! pm2 list | grep -q "$APP_NAME"; then
    echo "❌ PM2 app '$APP_NAME' not found!"
    echo "Current PM2 apps:"
    pm2 list
    exit 1
fi

cd "$APP_DIR"

log "📁 Working directory: $APP_DIR"
log "🔍 Current PM2 status:"
pm2 list | grep "$APP_NAME"

# Step 1: Backup current state
log "📦 Creating backup..."
cp -r . "../${APP_NAME}-backup-$(date +%Y%m%d_%H%M%S)" || warn "Backup failed, continuing..."

# Step 2: Stop PM2 app
log "⏹️  Stopping PM2 app..."
pm2 stop "$APP_NAME"

# Step 3: Update source code
log "📥 Pulling latest code..."
git pull origin main

# Step 4: Install dependencies
log "📚 Installing dependencies..."
npm install

# Step 5: Build TypeScript
log "🔨 Building TypeScript..."
npm run build

# Verify build
if [ ! -f "dist/server.js" ]; then
    echo "❌ Build failed - dist/server.js not found"
    echo "🔄 Starting old version..."
    pm2 start "$APP_NAME"
    exit 1
fi

# Step 6: Update PM2 to use new compiled server
log "🔄 Starting new TypeScript version..."
pm2 start ecosystem.config.js --env production

# Step 7: Verify
log "✅ Verifying deployment..."
sleep 3

if pm2 list | grep "$APP_NAME" | grep -q "online"; then
    log "✅ PM2 app is running"
else
    echo "❌ PM2 app failed to start"
    exit 1
fi

# Test health endpoint
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✅ Health check passed"
else
    warn "⚠️  Health check failed, but app may still be starting..."
fi

# Step 8: Save PM2 config
log "💾 Saving PM2 configuration..."
pm2 save

echo
echo "🎉 TypeScript upgrade completed successfully!"
echo
echo "📊 Next steps:"
echo "  • Monitor: pm2 monit"
echo "  • Logs:    pm2 logs $APP_NAME"
echo "  • Status:  pm2 list"
echo "  • Health:  curl http://localhost:3000/health"
echo
echo "🔧 If you have Nginx, you may want to reload it:"
echo "  sudo nginx -t && sudo systemctl reload nginx"
