// Simple Express server to serve the original web client interface
const express = require('express');
const path = require('path');
const { createServer } = require('vite');

const app = express();
const port = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Setting up static file serving...');
    
    // Serve static files from client directory
    app.use(express.static(path.resolve(__dirname, 'client')));
    
    // Simple API endpoint to verify server is working
    app.get('/api/health', (req, res) => {
      res.json({ status: 'Original web client is running', timestamp: new Date().toISOString() });
    });
    
    // Serve index.html for all routes (SPA behavior)
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client/index.html'));
    });

    console.log(`Starting original web client on http://localhost:${port}`);
    console.log('This serves the client/ directory interface, not the Expo app');
    
    app.listen(port, () => {
      console.log(`✓ Original web client is running on port ${port}`);
      console.log('✓ Using client/src/App.tsx instead of Expo app/(tabs)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();