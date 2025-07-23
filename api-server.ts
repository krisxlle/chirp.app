// Simple API-only server for mobile app backend
// Runs on port 5001, no Vite setup, no wildcard routes

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory (including generated images)
app.use(express.static('public'));

// Add basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API server running', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || '5001' 
  });
});

async function startAPIServer() {
  try {
    console.log('🚀 Starting Chirp API Server...');
    
    // Register all API routes (without Vite middleware)
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('API Error:', err);
      res.status(status).json({ message });
    });

    // Start the server
    const port = parseInt(process.env.PORT || '5001', 10);
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ API server running on http://localhost:${port}`);
      console.log('📱 Mobile app can now connect to API endpoints');
      
      // Try to initialize schedulers if they exist
      try {
        const { initializeScheduler, initializeNotificationScheduler } = require('./server/scheduler');
        if (initializeScheduler) {
          initializeScheduler();
          console.log('📅 Analytics scheduler initialized');
        }
        if (initializeNotificationScheduler) {
          initializeNotificationScheduler();
          console.log('🔔 Notification scheduler initialized');
        }
      } catch (error) {
        console.log('ℹ️  Scheduler modules not found, skipping initialization');
      }
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down API server...');
  process.exit(0);
});

// Start the server
startAPIServer();