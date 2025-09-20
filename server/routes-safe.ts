import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { log, serveStatic, setupVite } from "./vite";

export async function registerRoutesSafe(app: Express): Promise<Server> {
  console.log('🛠️  Starting safe route registration...');
  
  // Helper function to safely register a route
  function safeRoute(name: string, registerFunction: () => void) {
    try {
      console.log(`📍 Registering route: ${name}`);
      registerFunction();
      console.log(`✅ Successfully registered: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to register route: ${name}`, error);
      throw error;
    }
  }

  // 1. Health check endpoint - simple and safe
  safeRoute('Health Check', () => {
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });
  });

  // 2. Serve generated images
  safeRoute('Static Images', () => {
    app.use('/generated-images', express.static("public/generated-images"));
  });

  // 3. Auth middleware
  safeRoute('Auth Setup', async () => {
    try {
      const { setupAuth } = await import('./auth');
      await setupAuth(app);
    } catch (error) {
      console.log('⚠️  Auth setup failed, continuing without auth:', error.message);
    }
  });

  // 4. Basic API routes
  safeRoute('Basic API Routes', () => {
    // Simple test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working' });
    });

    // Another simple route
    app.post('/api/test', (req, res) => {
      res.json({ message: 'POST API is working', body: req.body });
    });
  });

  // 5. Try a route with parameters
  safeRoute('Parameterized Routes', () => {
    app.get('/api/users/:userId', (req, res) => {
      res.json({ message: 'User route working', userId: req.params.userId });
    });
  });

  // 6. Safe error middleware
  safeRoute('Error Middleware', () => {
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
  });

  // 7. Safe static file serving
  safeRoute('Static File Serving', () => {
    if (app.get("env") === "development") {
      console.log('⚠️  Skipping Vite setup in safe mode');
    } else {
      console.log('📁 Setting up static file serving...');
      serveStatic(app);
    }
  });

  // 8. Create HTTP server
  console.log('🌐 Creating HTTP server...');
  const server = createServer(app);
  
  return server;
}
