import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Serve static files with proper caching
app.use(express.static('.', {
  setHeaders: (res: Response, filePath: string) => {
    // Cache tiles for 1 month
    if (filePath.includes('/assets/tiles/')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
    // Cache other static assets for 1 week
    else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    }
  }
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'XCAOX Maps'
  });
});

// Handle SPA routing - serve index.html for all routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  console.log(`🗺️  XCAOX Maps running on port ${PORT}`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutdown signal received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
