#!/usr/bin/env node
// Simple server to serve the React web client from client/ directory
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 5000;

// Serve static files from client/public
app.use(express.static(path.join(__dirname, 'client/public')));

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`React web client server running on http://0.0.0.0:${PORT}`);
  console.log('Serving client/ directory pages as requested');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down React web client server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down React web client server...');
  process.exit(0);
});