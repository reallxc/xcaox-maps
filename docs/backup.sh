#!/bin/bash

# XCAOX Maps Backup Script
# Usage: ./backup.sh

set -e

# Configuration
APP_NAME="xcaox-maps"
APP_DIR="/var/www/$APP_NAME"
BACKUP_BASE_DIR="/var/backups/$APP_NAME"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup-$TIMESTAMP"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: $BACKUP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
}

# Backup application files
backup_app() {
    if [ -d "$APP_DIR" ]; then
        log_info "Backing up application files..."
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/app"
        log_success "Application files backed up"
    else
        log_warning "Application directory not found: $APP_DIR"
    fi
}

# Backup Nginx configuration
backup_nginx() {
    log_info "Backing up Nginx configuration..."
    sudo mkdir -p "$BACKUP_DIR/nginx"
    
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        sudo cp "/etc/nginx/sites-available/$APP_NAME" "$BACKUP_DIR/nginx/"
    fi
    
    # Backup main nginx config
    sudo cp /etc/nginx/nginx.conf "$BACKUP_DIR/nginx/nginx.conf"
    log_success "Nginx configuration backed up"
}

# Backup PM2 configuration
backup_pm2() {
    log_info "Backing up PM2 configuration..."
    sudo mkdir -p "$BACKUP_DIR/pm2"
    
    # Save PM2 dump
    pm2 save --force
    
    # Copy PM2 files
    if [ -d "$HOME/.pm2" ]; then
        sudo cp -r "$HOME/.pm2/dump.pm2" "$BACKUP_DIR/pm2/" 2>/dev/null || true
        sudo cp -r "$HOME/.pm2/ecosystem.config.js" "$BACKUP_DIR/pm2/" 2>/dev/null || true
    fi
    
    log_success "PM2 configuration backed up"
}

# Backup system logs
backup_logs() {
    log_info "Backing up logs..."
    sudo mkdir -p "$BACKUP_DIR/logs"
    
    # Application logs
    if [ -d "$HOME/.pm2/logs" ]; then
        sudo cp -r "$HOME/.pm2/logs" "$BACKUP_DIR/logs/pm2"
    fi
    
    # Nginx logs
    sudo cp /var/log/nginx/${APP_NAME}*.log "$BACKUP_DIR/logs/" 2>/dev/null || true
    
    log_success "Logs backed up"
}

# Create backup archive
create_archive() {
    log_info "Creating backup archive..."
    cd "$BACKUP_BASE_DIR"
    sudo tar -czf "backup-$TIMESTAMP.tar.gz" "backup-$TIMESTAMP"
    sudo rm -rf "backup-$TIMESTAMP"
    log_success "Backup archive created: backup-$TIMESTAMP.tar.gz"
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    sudo find "$BACKUP_BASE_DIR" -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
    log_success "Old backups cleaned up"
}

# Set proper permissions
set_permissions() {
    log_info "Setting backup permissions..."
    sudo chown -R root:root "$BACKUP_BASE_DIR"
    sudo chmod -R 600 "$BACKUP_BASE_DIR"
    log_success "Permissions set"
}

# Main backup function
main() {
    log_info "Starting backup process for $APP_NAME..."
    
    create_backup_dir
    backup_app
    backup_nginx
    backup_pm2
    backup_logs
    create_archive
    cleanup_old_backups
    set_permissions
    
    log_success "Backup completed successfully!"
    log_info "Backup location: $BACKUP_BASE_DIR/backup-$TIMESTAMP.tar.gz"
}

# Run main function
main "$@"
