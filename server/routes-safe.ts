import type { Express } from "express";
import express from "express";
import fs from 'fs';
import path from 'path';
import { createServer, type Server } from "http";
import { log, serveStatic, setupVite } from "./vite";
import { supabase } from "./db";

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
    
    // Add a simple test route to verify our server is receiving requests
    app.get('/test', (req, res) => {
      res.json({ 
        message: 'Chirp server is working!', 
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      });
    });
    
    // Add a database test endpoint
    app.get('/api/test/db', async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .limit(5);
        
        if (error) {
          res.json({ 
            success: false, 
            error: error.message,
            message: 'Database connection failed'
          });
        } else {
          res.json({ 
            success: true, 
            message: 'Database connection successful',
            userCount: data?.length || 0,
            users: data
          });
        }
      } catch (error) {
        res.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Database test failed'
        });
      }
    });
    
    // Add a public chirps test endpoint
    app.get('/api/test/chirps', async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('chirps')
          .select(`
            id,
            content,
            created_at,
            author_id,
            users!inner(id, first_name, last_name, email, handle)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          res.json({ 
            success: false, 
            error: error.message,
            message: 'Chirps query failed'
          });
        } else {
          res.json({ 
            success: true, 
            message: 'Chirps retrieved successfully',
            chirpCount: data?.length || 0,
            chirps: data
          });
        }
      } catch (error) {
        res.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Chirps test failed'
        });
      }
    });
    
    // Root route removed - let static file serving handle it
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
    console.log('🔍 DEBUG: Starting static file serving setup...');
    console.log('🔍 DEBUG: Environment:', app.get("env"));
    
    if (app.get("env") === "development") {
      console.log('⚠️  Skipping Vite setup in safe mode');
    } else {
      console.log('📁 Setting up safe static file serving...');
      
      const distPath = path.join(process.cwd(), "dist");
      console.log('📁 Checking for dist directory:', distPath);
      console.log('📁 Current working directory:', process.cwd());
      console.log('📁 Directory contents:', fs.readdirSync(process.cwd()));
      
      if (!fs.existsSync(distPath)) {
        console.log('⚠️  Dist directory not found, skipping static file serving');
        console.log('📁 Available directories:', fs.readdirSync(process.cwd()).filter(item => fs.statSync(item).isDirectory()));
        return;
      }
      
      console.log('📁 Dist directory found, setting up static serving...');
      console.log('📁 Dist directory contents:', fs.readdirSync(distPath));
      console.log('📁 Checking for index.html:', fs.existsSync(path.join(distPath, 'index.html')));
      
      try {
        console.log('🔍 DEBUG: About to call express.static...');
        // Simple static file serving without complex middleware
        app.use(express.static(distPath));
        console.log('✅ express.static configured successfully');
        
        // Add debugging middleware to see what requests are coming in
        app.use((req, res, next) => {
          console.log('🔍 DEBUG: Request received:', req.method, req.path);
          next();
        });
        
        console.log('🔍 DEBUG: About to set up SPA fallback...');
        // Use a safer SPA fallback pattern
        app.use((req, res, next) => {
          console.log('🔍 DEBUG: SPA fallback called for:', req.path);
          
          // Skip API routes
          if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
          }
          
          // Skip static file requests (they should be handled by express.static)
          if (req.path.includes('.')) {
            return next();
          }
          
          // Serve index.html for SPA routing
          const indexPath = path.join(distPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.json({ 
              message: 'Chirp app is running', 
              note: 'Static files available but index.html not found'
            });
          }
        });
        console.log('✅ SPA fallback configured successfully');
        
        console.log('✅ Safe static file serving configured');
      } catch (error) {
        console.error('❌ Error in static file serving setup:', error);
        throw error;
      }
    }
  });

  // 8. Create HTTP server
  console.log('🌐 Creating HTTP server...');
  const server = createServer(app);
  
  return server;
}
