import express, { NextFunction, type Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { testDatabaseConnection } from "./db";
import { truncateSensitiveData } from "./loggingUtils";
import { generalApiLimiter } from "./rateLimiting";
import { registerRoutes } from "./routes";
import { registerRoutesSafe } from "./routes-safe";
import { devServerProtection, securityLogging, securityMiddleware } from "./security";
import { log, serveStatic, setupVite } from "./vite";

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error.message.includes('path-to-regexp') || error.message.includes('Missing parameter name')) {
    console.log('Path-to-regexp error detected, continuing with fallback...');
    return; // Don't exit, continue running
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const error = reason as Error;
    if (error.message.includes('path-to-regexp') || error.message.includes('Missing parameter name')) {
      console.log('Path-to-regexp error in promise rejection, continuing...');
      return; // Don't exit, continue running
    }
  }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply security middleware
app.use(securityLogging);
app.use(securityMiddleware);
app.use(devServerProtection);

// Apply general rate limiting to all API routes
app.use('/api', generalApiLimiter);

// Serve static files from public directory (including generated images)
app.use(express.static('public'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Truncate long responses and sensitive data
        const responseStr = JSON.stringify(capturedJsonResponse);
        const truncatedResponse = truncateSensitiveData(responseStr);
        logLine += ` :: ${truncatedResponse}`;
      }

      // Ensure log line doesn't exceed reasonable length
      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('🚀 Starting Chirp server...');
    
    let server;
    let usingSafeRoutes = false;
    
    try {
      console.log('🔄 Trying safe route registration first...');
      server = await registerRoutesSafe(app);
      console.log('✅ Safe route registration successful!');
      usingSafeRoutes = true;
    } catch (safeRouteError) {
      console.error('❌ Safe route registration failed:', safeRouteError);
      
      console.log('🔄 Falling back to full route registration...');
      try {
        server = await registerRoutes(app);
        console.log('✅ Full route registration successful!');
        usingSafeRoutes = false;
      } catch (routeError) {
        console.error('❌ Error during full route registration:', routeError);
        
        // If there's a path-to-regexp error during route registration, start minimal server immediately
        if (routeError.message && routeError.message.includes('path-to-regexp')) {
          throw routeError; // Re-throw to trigger the fallback
        }
        
        // For other route errors, also trigger fallback
        throw routeError;
      }
    }

    // Only add additional middleware if not using safe routes (they're already handled)
    if (!usingSafeRoutes) {
      console.log('🔧 Adding additional middleware for full routes...');
      
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
      });

      // importantly only setup vite in development and after
      // setting up all the other routes so the catch-all route
      // doesn't interfere with the other routes
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
    } else {
      console.log('✅ Using safe routes - skipping additional middleware setup');
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "0.0.0.0", async () => {
      log(`serving on port ${port}`);
      
      // Test database connection
      try {
        await testDatabaseConnection();
      } catch (error) {
        console.error('❌ Database connection test failed:', error);
      }
      
      // Try to initialize schedulers if they exist
      try {
        const { initializeScheduler, initializeNotificationScheduler } = require('./scheduler');
        if (initializeScheduler) initializeScheduler();
        if (initializeNotificationScheduler) initializeNotificationScheduler();
      } catch (error) {
        log('Scheduler modules not found, skipping initialization');
      }
    });
    
    console.log('✅ Chirp server started successfully');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // If there's a path-to-regexp error or any route-related error, start a minimal server
    if (error.message && (
      error.message.includes('path-to-regexp') || 
      error.message.includes('Missing parameter name') ||
      error.message.includes('route') ||
      error.message.includes('registerRoutes')
    )) {
      console.log('🔄 Starting minimal server due to path-to-regexp error...');
      
      const port = parseInt(process.env.PORT || '5000', 10);
      
      // Create a completely independent minimal server
      const minimalApp = express();
      minimalApp.use(express.json());
      
      // Health check endpoint - simple and safe
      minimalApp.get('/api/health', (req, res) => {
        res.json({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0',
          mode: 'minimal'
        });
      });
      
      // Simple static file serving without complex routing
      const distPath = path.join(process.cwd(), 'dist');
      console.log('📁 Checking for static files at:', distPath);
      
      if (fs.existsSync(distPath)) {
        console.log('📁 Static files found, setting up serving...');
        
        // Add rate limiting for static file serving
        const staticLimiter = rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 200, // limit each IP to 200 requests per windowMs
          message: 'Too many static file requests from this IP, please try again later.',
          standardHeaders: true,
          legacyHeaders: false,
        });
        
        minimalApp.use(staticLimiter);
        
        // Simple static middleware with path validation
        minimalApp.use((req, res, next) => {
          if (req.path.startsWith('/api/')) {
            return next();
          }
          
          // Sanitize and validate the request path
          const sanitizedPath = req.path.replace(/\.\./g, '').replace(/\/+/g, '/');
          if (sanitizedPath !== req.path) {
            return res.status(400).json({ error: 'Invalid path' });
          }
          
          // Only allow specific file extensions for security
          const allowedExtensions = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
          const hasValidExtension = allowedExtensions.some(ext => sanitizedPath.endsWith(ext));
          
          if (sanitizedPath !== '/' && !hasValidExtension && !sanitizedPath.includes('.')) {
            // SPA fallback - serve index.html for any non-API route without file extension
            const indexPath = path.join(distPath, 'index.html');
            if (fs.existsSync(indexPath)) {
              res.sendFile(indexPath);
            } else {
              res.json({ 
                message: 'Chirp server is running in minimal mode', 
                note: 'Static files not found'
              });
            }
            return;
          }
          
          const filePath = path.join(distPath, sanitizedPath === '/' ? 'index.html' : sanitizedPath);
          
          // Ensure the resolved path is within the dist directory
          const resolvedPath = path.resolve(filePath);
          const resolvedDistPath = path.resolve(distPath);
          if (!resolvedPath.startsWith(resolvedDistPath)) {
            return res.status(400).json({ error: 'Invalid path' });
          }
          
          // Check if file exists
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.sendFile(filePath);
          } else {
            res.status(404).json({ error: 'File not found' });
          }
        });
      } else {
        console.log('⚠️  No static files found at:', distPath);
        
        // Fallback response for all routes
        minimalApp.get('*', (req, res) => {
          res.json({ 
            message: 'Chirp server is running in minimal mode', 
            note: 'Static files not found - server started successfully but web app not built'
          });
        });
      }
      
      // Start the server
      const server = minimalApp.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Minimal server running on port ${port}`);
        console.log('⚠️  Running in minimal mode - some features may be unavailable');
        console.log('✅ Health check available at /api/health');
      });
      
      // Handle server errors
      server.on('error', (err) => {
        console.error('❌ Minimal server error:', err);
      });
    } else {
      // For other errors, exit
      process.exit(1);
    }
  }
})();
