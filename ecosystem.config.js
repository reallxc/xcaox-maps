module.exports = {
  apps: [{
    name: 'xcaox-maps',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging configuration
    error_file: '/var/log/xcaox-maps/err.log',
    out_file: '/var/log/xcaox-maps/out.log',
    log_file: '/var/log/xcaox-maps/combined.log',
    time: true,
    
    // Advanced PM2 features
    min_uptime: '10s',
    max_restarts: 10,
    
    // Environment variables for production
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Add any other production environment variables here
    }
  }],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/xcaox-maps.git',
      path: '/var/www/xcaox-maps',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install nodejs npm -y'
    }
  }
};
