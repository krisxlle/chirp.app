const express = require('express');
const path = require('path');

const app = express();
const PORT = 5001;

// Serve static files from the public directory
app.use('/generated-images', express.static(path.join(__dirname, 'public', 'generated-images')));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Image server running on http://localhost:${PORT}`);
  console.log(`Serving images from: ${path.join(__dirname, 'public', 'generated-images')}`);
});