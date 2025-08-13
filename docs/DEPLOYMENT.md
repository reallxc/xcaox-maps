# 🚀 XCAOX Maps - Ubuntu Server Deployment Guide

This guide walks you through deploying XCAOX Maps to an Ubuntu 20.04+ server.

## 📋 Prerequisites

- Ubuntu 20.04+ server with sudo privileges
- Domain name pointing to your server (optional but recommended)
- At least 1GB RAM and 10GB disk space

## 🛠️ Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install Required Packages
```bash
sudo apt install -y nginx git ufw
sudo npm install -g pm2
```

### 4. Create Application User (Optional)
```bash
sudo adduser --system --group --home /var/www xcaox
sudo usermod -aG www-data xcaox
```

## 📦 Application Deployment

### Option A: Automated Deployment (Recommended)
```bash
# Clone repository
git clone <your-repository-url> /tmp/xcaox-maps
cd /tmp/xcaox-maps

# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh production
```

### Option B: Manual Deployment

#### 1. Deploy Application
```bash
# Create application directory
sudo mkdir -p /var/www/xcaox-maps
sudo chown $USER:$USER /var/www/xcaox-maps

# Clone and setup
git clone <your-repository-url> /var/www/xcaox-maps
cd /var/www/xcaox-maps
npm install --production
```

#### 2. Configure PM2
```bash
npm run pm2:start
pm2 startup
pm2 save
```

#### 3. Configure Nginx
```bash
# Copy configuration
sudo cp docs/nginx.conf /etc/nginx/sites-available/xcaox-maps

# Edit server name (replace with your domain)
sudo nano /etc/nginx/sites-available/xcaox-maps

# Enable site
sudo ln -s /etc/nginx/sites-available/xcaox-maps /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## 🔒 Security Configuration

### 1. SSL Certificate with Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### 2. Additional Security Headers
Already configured in the Nginx configuration file.

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs xcaox-maps

# Monitor in real-time
pm2 monit

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop
```

### System Commands
```bash
# Check Nginx status
sudo systemctl status nginx

# Check disk usage
df -h

# Check memory usage
free -h

# View system logs
sudo journalctl -u nginx -f
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
cd /var/www/xcaox-maps

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart application
npm run pm2:restart
```

### System Updates
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
sudo systemctl restart nginx
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs xcaox-maps

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart xcaox-maps
```

#### 2. Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/xcaox-maps
sudo chmod -R 755 /var/www/xcaox-maps
```

#### 4. Health Check
Visit `http://your-domain/health` to check if the application is running.

## 📈 Performance Optimization

### 1. Enable Gzip (Already configured in Nginx)

### 2. PM2 Cluster Mode (For high traffic)
```bash
# Edit ecosystem.config.js
# Change instances to 'max' or number of CPU cores
pm2 reload ecosystem.config.js
```

### 3. Database Optimization (If using)
- Configure connection pooling
- Add database indices
- Regular maintenance tasks

## 🔐 Backup Strategy

### 1. Application Backup
```bash
# Create backup script
sudo cp /var/www/xcaox-maps/docs/backup.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup.sh

# Add to crontab for daily backups
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup.sh
```

### 2. Database Backup (If applicable)
Configure regular database backups based on your database system.

## 📞 Support

- Check logs: `pm2 logs xcaox-maps`
- Health check: `http://your-domain/health`
- System status: `sudo systemctl status nginx`

---

## 🎯 Quick Commands Reference

```bash
# Deployment
./deploy.sh production

# Status checks
pm2 status
sudo systemctl status nginx
curl http://localhost/health

# Logs
pm2 logs xcaox-maps
sudo journalctl -u nginx -f

# Restart services
npm run pm2:restart
sudo systemctl restart nginx

# Updates
git pull && npm install --production && npm run pm2:restart
```

Your XCAOX Maps application should now be running at `http://your-domain` (or your server IP)! 🎉
