// Simple Express server to serve the built application
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Add request parsing middleware with better error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', buf.toString());
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: false }));

// API routes - define these early
app.get('/api/health', (req, res) => {
  res.json({ status: 'Application server is running', timestamp: new Date().toISOString() });
});

// Push token management (for mobile push notifications)
app.post('/api/push-tokens', async (req, res) => {
  try {
    console.log('Received push token request:', req.body);
    
    const userId = 'chirp-preview-001'; // Default to @chirp account for demo
    
    // Simple validation
    const { token, platform } = req.body;
    if (!token || !platform) {
      console.log('Missing required fields:', { token: !!token, platform: !!platform });
      return res.status(400).json({ error: 'Token and platform are required' });
    }

    // For now, just log the token registration
    console.log('Push token registered successfully:', { userId, token, platform });
    res.json({ success: true, message: 'Push token registered' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

async function startServer() {
  try {
    console.log('Setting up static file serving...');
    
    // Check if dist directory exists
    const distPath = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('Dist directory not found, checking for public directory...');
      const publicPath = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicPath)) {
        console.error('Neither dist nor public directory found. Building application...');
        // Try to build the application
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
          console.log('Running build command...');
          await execPromise('npm run build');
          console.log('Build completed successfully');
        } catch (buildError) {
          console.error('Build failed:', buildError);
          console.log('Serving from Expo dev server instead...');
        }
      } else {
        // Use public directory if available
        app.use(express.static(publicPath));
        console.log('Serving static files from public directory');
      }
    } else {
      // Serve static files from dist directory (built Expo web app)
      app.use(express.static(distPath));
      console.log('Serving static files from dist directory');
    }
    
    // SPA fallback route - use middleware instead of wildcard route to avoid path-to-regexp issues
    app.use((req, res, next) => {
      // Skip API routes or if response already sent
      if (req.path.startsWith('/api') || res.headersSent) {
        return next();
      }
      
      // Try dist first, then public, then fallback
      const possiblePaths = [
        path.resolve(__dirname, 'dist/index.html'),
        path.resolve(__dirname, 'public/index.html'),
        path.resolve(__dirname, 'client/index.html')
      ];
      
      let indexPath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      }
      
      if (!indexPath) {
        console.error('No index.html found in any expected location');
        return res.status(404).send(`
          <html>
            <body>
              <h1>Application not found</h1>
              <p>Please build the client first using: <code>npm run build</code></p>
              <p>Checked paths:</p>
              <ul>
                ${possiblePaths.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </body>
          </html>
        `);
      }
      
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    });

    // Error handling middleware - must be at the end
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      if (err.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'Invalid JSON in request body' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    console.log(`Starting application server on http://localhost:${port}`);
    console.log('Checking for built assets and serving application...');
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✓ Application server is running on port ${port}`);
      console.log(`✓ Visit http://localhost:${port} to view the app`);
      console.log(`✓ Push tokens API available at http://localhost:${port}/api/push-tokens`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();