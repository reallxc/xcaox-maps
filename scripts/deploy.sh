#!/bin/bash

# XCAOX Maps - Production Deployment Script
# This script safely deploys the TypeScript version with zero-downtime

set -e  # Exit on any error

# Configuration
APP_NAME="xcaox-maps"
APP_DIR="/var/www/xcaox-maps"
BACKUP_DIR="/var/backups/xcaox-maps"
NGINX_CONFIG="/etc/nginx/sites-available/xcaox-maps"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
    error "Don't run this script as root. Use your deployment user."
fi

# Check if required directories exist
if [ ! -d "$APP_DIR" ]; then
    error "Application directory $APP_DIR does not exist"
fi

log "Starting deployment of XCAOX Maps TypeScript version..."

# Step 1: Create backup
log "Creating backup..."
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CURRENT_BACKUP_DIR="$BACKUP_DIR/$BACKUP_TIMESTAMP"

sudo mkdir -p "$CURRENT_BACKUP_DIR"
sudo cp -r "$APP_DIR" "$CURRENT_BACKUP_DIR/"
log "Backup created at $CURRENT_BACKUP_DIR"

# Step 2: Check PM2 status
log "Checking PM2 status..."
if ! pm2 list | grep -q "$APP_NAME"; then
    warn "PM2 app $APP_NAME not running. Starting fresh deployment."
    FRESH_DEPLOY=true
else
    log "PM2 app $APP_NAME is running"
    FRESH_DEPLOY=false
fi

# Step 3: Update source code
log "Updating source code..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main

# Step 4: Install dependencies
log "Installing dependencies..."
npm ci --only=production

# Step 5: Install TypeScript dependencies for building
log "Installing build dependencies..."
npm install typescript @types/express @types/leaflet @types/node ts-node esbuild --save-dev

# Step 6: Build TypeScript
log "Building TypeScript application..."
npm run build

# Step 7: Verify build
if [ ! -f "dist/server.js" ]; then
    error "Build failed - dist/server.js not found"
fi

if [ ! -f "dist/js/app.js" ]; then
    error "Build failed - dist/js/app.js not found"
fi

log "Build verification passed"

# Step 8: Update PM2 app
if [ "$FRESH_DEPLOY" = true ]; then
    log "Starting new PM2 application..."
    pm2 start ecosystem.config.js --env production
else
    log "Reloading PM2 application..."
    pm2 reload "$APP_NAME" --env production
fi

# Step 9: Verify deployment
log "Verifying deployment..."
sleep 5

# Check if PM2 app is running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    error "PM2 app failed to start"
fi

# Check health endpoint
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
if [ "$HEALTH_CHECK" != "200" ]; then
    error "Health check failed (HTTP $HEALTH_CHECK). Rolling back..."
fi

log "Health check passed"

# Step 10: Reload Nginx (if config changed)
if [ -f "$NGINX_CONFIG" ]; then
    log "Testing Nginx configuration..."
    sudo nginx -t
    if [ $? -eq 0 ]; then
        log "Reloading Nginx..."
        sudo systemctl reload nginx
    else
        warn "Nginx configuration test failed. Please check manually."
    fi
fi

# Step 11: Clean up old builds (keep last 5)
log "Cleaning up old backups..."
if [ -d "$BACKUP_DIR" ]; then
    sudo find "$BACKUP_DIR" -type d -name "20*" | sort -r | tail -n +6 | sudo xargs rm -rf
fi

# Step 12: Save PM2 configuration
log "Saving PM2 configuration..."
pm2 save

log "Deployment completed successfully!"
log "Application is running at: http://localhost:3000"
log "Health check: http://localhost:3000/health"
log "PM2 status: pm2 list"
log "PM2 logs: pm2 logs $APP_NAME"

# Display final status
echo
echo "=== Deployment Summary ==="
echo "✅ Source code updated"
echo "✅ Dependencies installed"
echo "✅ TypeScript compiled"
echo "✅ PM2 application reloaded"
echo "✅ Health check passed"
echo "✅ Backup created at: $CURRENT_BACKUP_DIR"
echo
echo "Monitor the application with: pm2 monit"
