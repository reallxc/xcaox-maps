#!/bin/bash

# XCAOX Maps Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on any error

# Configuration
APP_NAME="xcaox-maps"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
NGINX_SITE="/etc/nginx/sites-available/$APP_NAME"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root. Run as a regular user with sudo privileges."
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Install with: sudo npm install -g pm2"
        exit 1
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx is not installed. Install with: sudo apt install nginx"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Create backup
create_backup() {
    if [ -d "$APP_DIR" ]; then
        log_info "Creating backup..."
        sudo mkdir -p "$BACKUP_DIR"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
        log_success "Backup created"
    fi
}

# Deploy application
deploy_app() {
    log_info "Deploying $APP_NAME..."
    
    # Create app directory
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    
    # Copy files
    cp -r . "$APP_DIR/"
    cd "$APP_DIR"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install --production
    
    log_success "Application deployed"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Copy Nginx configuration
    sudo cp docs/nginx.conf "$NGINX_SITE"
    
    # Update server_name (you'll need to edit this manually)
    log_warning "Remember to update server_name in $NGINX_SITE"
    
    # Enable site
    sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    log_success "Nginx configured"
}

# Configure PM2
configure_pm2() {
    log_info "Configuring PM2..."
    
    cd "$APP_DIR"
    
    # Stop existing process if running
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start with PM2
    npm run pm2:start
    
    # Setup PM2 startup
    pm2 startup | grep "sudo" | bash || true
    pm2 save
    
    log_success "PM2 configured and application started"
}

# Setup firewall
setup_firewall() {
    log_info "Configuring firewall..."
    
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    
    log_success "Firewall configured"
}

# Main deployment function
main() {
    local env=${1:-production}
    
    log_info "Starting deployment for environment: $env"
    
    check_root
    check_prerequisites
    create_backup
    deploy_app
    configure_nginx
    configure_pm2
    setup_firewall
    
    log_success "Deployment completed successfully!"
    log_info "Application is running at: http://$(hostname -I | awk '{print $1}'):80"
    log_info "Check status with: pm2 status"
    log_info "View logs with: pm2 logs $APP_NAME"
    log_info "Monitor with: pm2 monit"
}

# Run main function
main "$@"
