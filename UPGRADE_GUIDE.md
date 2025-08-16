# 🔄 TypeScript Upgrade Guide for Production

## Quick Reference for Your PM2 + Nginx Setup

### 🚀 Option 1: One-Command Upgrade (Recommended)

```bash
# On your production server
cd /var/www/xcaox-maps  # or your app directory
./scripts/upgrade-typescript.sh
```

This script will:
- ✅ Backup current version
- ✅ Stop PM2 safely
- ✅ Pull latest code
- ✅ Install TypeScript dependencies
- ✅ Build the application
- ✅ Start with new compiled version
- ✅ Verify deployment

### 🔧 Option 2: Manual Step-by-Step

If you prefer manual control:

```bash
# 1. Navigate to your app directory
cd /var/www/xcaox-maps  # adjust path as needed

# 2. Check current status
pm2 list
pm2 logs xcaox-maps --lines 10

# 3. Create quick backup
cp -r . ../xcaox-maps-backup-$(date +%Y%m%d_%H%M%S)

# 4. Stop the current app
pm2 stop xcaox-maps

# 5. Update source code
git pull origin main

# 6. Install dependencies (including TypeScript build tools)
npm install

# 7. Build TypeScript
npm run build

# 8. Start new version
pm2 start ecosystem.config.js --env production

# 9. Verify
pm2 list
curl http://localhost:3000/health

# 10. Save PM2 config
pm2 save
```

### 🔍 Verification Steps

After upgrade, verify everything works:

```bash
# Check PM2 status
pm2 list

# Check application logs
pm2 logs xcaox-maps --lines 50

# Test health endpoint
curl http://localhost:3000/health

# Test main application
curl -I http://localhost:3000

# Monitor in real-time
pm2 monit
```

### 🆘 If Something Goes Wrong

#### Quick Rollback
```bash
# Stop current version
pm2 stop xcaox-maps

# Go back to backup
cd ../xcaox-maps-backup-*  # latest backup
pm2 start server.js --name xcaox-maps  # original JS version

# Or use ecosystem config if available
pm2 start ecosystem.config.js --env production
```

#### Common Issues & Fixes

**Build fails:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

**PM2 won't start:**
```bash
# Check the compiled file exists
ls -la dist/server.js

# Test manually
node dist/server.js

# Check for port conflicts
sudo lsof -i :3000
```

**Memory issues:**
```bash
# Check current memory usage
pm2 show xcaox-maps

# Increase memory limit in ecosystem.config.js
# max_memory_restart: '1G'  # increase from 512M
```

### 📋 Pre-Upgrade Checklist

Before starting the upgrade:

- [ ] **Backup**: Ensure you have recent backups
- [ ] **Resources**: Check server has enough disk space (`df -h`)
- [ ] **Dependencies**: Verify Node.js version is 16+ (`node --version`)
- [ ] **PM2**: Confirm current app is running (`pm2 list`)
- [ ] **Nginx**: Note current Nginx config if custom
- [ ] **Database**: Backup any data if applicable

### 📊 Post-Upgrade Checklist

After successful upgrade:

- [ ] **Application**: Test all major features
- [ ] **Performance**: Monitor memory/CPU usage
- [ ] **Logs**: Check for any error messages
- [ ] **Health**: Verify `/health` endpoint responds
- [ ] **Nginx**: Reload Nginx if needed (`sudo nginx -t && sudo systemctl reload nginx`)
- [ ] **SSL**: Verify HTTPS still works (if configured)
- [ ] **Monitoring**: Set up alerts for the new version

### 🎯 Key Changes After Upgrade

**What's Different:**
- Main server file is now `dist/server.js` (compiled from TypeScript)
- Client JavaScript is bundled into `dist/js/app.js`
- Build step is required (`npm run build`) before deployment
- TypeScript provides better error checking and IDE support

**What Stays the Same:**
- All functionality remains identical
- Nginx configuration unchanged
- PM2 process management unchanged
- API endpoints and responses unchanged
- Performance should be similar or better

### 📞 Support Commands

Keep these handy for monitoring:

```bash
# Real-time monitoring
pm2 monit

# Application logs
pm2 logs xcaox-maps -f

# System resources
htop

# Nginx status
sudo systemctl status nginx

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### 🔐 Production Tips

1. **Test First**: Try the upgrade on a staging server if possible
2. **Off-Peak Hours**: Deploy during low-traffic periods
3. **Monitor Closely**: Watch logs and metrics for first 30 minutes
4. **Keep Backups**: Don't delete old backups immediately
5. **Document Changes**: Note any custom modifications you've made

---

**Need Help?** 
- Check the troubleshooting section above
- Review PM2 and application logs
- Ensure all files built correctly in the `dist/` folder
- Verify the ecosystem.config.js points to `dist/server.js`
