// Production-ready startup script with robust error handling
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const port = process.env.PORT || 5000;

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint - define early to avoid conflicts
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

async function ensureClientBuilt() {
  const possiblePaths = [
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, 'public'),
    path.resolve(__dirname, 'build')
  ];

  // Check if any build directory exists
  for (const buildPath of possiblePaths) {
    if (fs.existsSync(buildPath)) {
      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`Found built app at: ${buildPath}`);
        return buildPath;
      }
    }
  }

  console.log('No built application found. Attempting to build...');
  
  try {
    console.log('Running: npm run build');
    await execPromise('npm run build');
    
    // Check again after build
    for (const buildPath of possiblePaths) {
      if (fs.existsSync(buildPath)) {
        const indexPath = path.join(buildPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          console.log(`Build successful! App available at: ${buildPath}`);
          return buildPath;
        }
      }
    }
    
    throw new Error('Build completed but no valid output found');
  } catch (buildError) {
    console.error('Build failed:', buildError.message);
    throw new Error('Unable to build or locate client application');
  }
}

async function startServer() {
  try {
    console.log('🚀 Starting production server...');
    
    // Ensure we have a built client
    const staticPath = await ensureClientBuilt();
    
    // Serve static files, but skip API routes
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      express.static(staticPath, {
        maxAge: '1y', // Cache static assets for 1 year
        etag: true
      })(req, res, next);
    });

    // SPA fallback - serve index.html for non-API routes
    app.use((req, res, next) => {
      // Skip API routes or if response already sent
      if (req.path.startsWith('/api') || res.headersSent) {
        return next();
      }
      
      const indexPath = path.join(staticPath, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send(`
          <html>
            <body>
              <h1>Application Error</h1>
              <p>Client application files not found.</p>
              <p>Expected: ${indexPath}</p>
            </body>
          </html>
        `);
      }
      
      // Send index.html for SPA routes
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    });

    // 404 handler for unmatched routes
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handling middleware - must be last
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log(`✅ Serving static files from: ${staticPath}`);
      console.log(`✅ API endpoints available at: http://localhost:${port}/api/`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();