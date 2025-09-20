// Vercel serverless function entry point
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'vercel'
  });
});

// Serve static files
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.json({ 
      message: 'Chirp app - static files not found',
      note: 'Build may be in progress'
    });
  });
}

// Export for Vercel
export default app;
