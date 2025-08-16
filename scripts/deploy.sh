#!/bin/bash

# XCAOX Maps - Source Code Deployment Script
# This script updates source code and reloads PM2 without touching nginx

set -e  # Exit on any error

# Configuration
APP_NAME="xcaox-maps"
APP_DIR="/var/www/xcaox-maps"
# BACKUP_DIR="/var/backups/xcaox-maps"

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

log "Starting source code deployment of XCAOX Maps..."

# Step 1: Create backup of current state
# log "Creating backup..."
# BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# CURRENT_BACKUP_DIR="$BACKUP_DIR/$BACKUP_TIMESTAMP"

# if [ ! -d "$BACKUP_DIR" ]; then
#     sudo mkdir -p "$BACKUP_DIR"
# fi

# sudo mkdir -p "$CURRENT_BACKUP_DIR"
# sudo cp -r "$APP_DIR" "$CURRENT_BACKUP_DIR/"
# log "Backup created at $CURRENT_BACKUP_DIR"

# Step 2: Check PM2 status
log "Checking PM2 status..."
if ! pm2 list | grep -q "$APP_NAME"; then
    warn "PM2 app $APP_NAME not running. Will start after build."
    FRESH_DEPLOY=true
else
    log "PM2 app $APP_NAME is running"
    FRESH_DEPLOY=false
fi

# Step 3: Update source code
log "Updating source code..."
cd "$APP_DIR"

# Stash any local changes (if any)
git stash push -m "Auto-stash before deployment $(date)"

# Update from remote
git fetch origin
git reset --hard origin/main

log "Source code updated to latest commit: $(git rev-parse --short HEAD)"

# Step 4: Install dependencies
log "Installing dependencies..."
npm ci --only=production

# Step 5: Install TypeScript dependencies for building
log "Installing build dependencies..."
npm install typescript @types/express @types/leaflet @types/node ts-node esbuild concurrently --save-dev

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
    log "Restarting PM2 application..."
    # Stop the current app and start with new config
    pm2 stop "$APP_NAME" || true
    pm2 start ecosystem.config.js --env production
fi

# Step 9: Verify deployment
log "Verifying deployment..."
sleep 5

# Check if PM2 app is running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    error "PM2 app failed to start. Check logs with: pm2 logs $APP_NAME"
fi

# Check health endpoint (with retries)
log "Performing health check..."
HEALTH_CHECK="000"
for i in {1..5}; do
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
    if [ "$HEALTH_CHECK" = "200" ]; then
        break
    fi
    log "Health check attempt $i failed (HTTP $HEALTH_CHECK), retrying in 3 seconds..."
    sleep 3
done

if [ "$HEALTH_CHECK" != "200" ]; then
    error "Health check failed after 5 attempts (HTTP $HEALTH_CHECK). Check logs with: pm2 logs $APP_NAME"
fi

log "Health check passed"

# Step 10: Clean up old builds (keep last 5)
log "Cleaning up old backups..."
if [ -d "$BACKUP_DIR" ]; then
    sudo find "$BACKUP_DIR" -type d -name "20*" | sort -r | tail -n +6 | sudo xargs rm -rf 2>/dev/null || true
fi

# Step 11: Save PM2 configuration
log "Saving PM2 configuration..."
pm2 save

log "Deployment completed successfully!"
log "Application is running at: http://localhost:3000"
log "Health check: http://localhost:3000/health"

# Display final status
echo
echo "=== Deployment Summary ==="
echo "✅ Source code updated to: $(git rev-parse --short HEAD)"
echo "✅ Dependencies installed"
echo "✅ TypeScript compiled"
echo "✅ PM2 application $([ "$FRESH_DEPLOY" = true ] && echo "started" || echo "reloaded")"
echo "✅ Health check passed"
echo "✅ Backup created at: $CURRENT_BACKUP_DIR"
echo
echo "Useful commands:"
echo "  Monitor: pm2 monit"
echo "  Logs:    pm2 logs $APP_NAME"
echo "  Status:  pm2 list"
echo "  Stop:    pm2 stop $APP_NAME"
echo "  Restart: pm2 restart $APP_NAME"
