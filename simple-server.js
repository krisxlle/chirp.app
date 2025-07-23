// Simple Express server to serve the original web client interface
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function startServer() {
  try {
    console.log('Setting up static file serving...');
    
    // Serve static files from client directory
    app.use(express.static(path.resolve(__dirname, 'client')));
    
    // Simple API endpoint to verify server is working
    app.get('/api/health', (req, res) => {
      res.json({ status: 'Original web client is running', timestamp: new Date().toISOString() });
    });
    
    // Serve index.html for all non-API routes (SPA behavior)
    // Use a more robust pattern that doesn't cause path-to-regexp issues
    app.use('*', (req, res, next) => {
      // Skip if it's an API route
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      const indexPath = path.resolve(__dirname, 'client/index.html');
      
      // Check if index.html exists before serving
      if (!fs.existsSync(indexPath)) {
        console.error('index.html not found at:', indexPath);
        return res.status(404).send('Application not found. Please build the client first.');
      }
      
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    });

    console.log(`Starting original web client on http://localhost:${port}`);
    console.log('This serves the client/ directory interface, not the Expo app');
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✓ Original web client is running on port ${port}`);
      console.log('✓ Using client/src/App.tsx instead of Expo app/(tabs)');
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