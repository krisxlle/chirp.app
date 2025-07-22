#!/usr/bin/env node

// This script serves the original web client interface from client/ directory
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static assets
app.use(express.static(path.join(__dirname, 'client')));
app.use('/src', express.static(path.join(__dirname, 'client/src')));
app.use('/public', express.static(path.join(__dirname, 'client/public')));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'Original web client is running', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Original web client interface is running on http://localhost:${PORT}`);
  console.log('✓ Serving from client/ directory (NOT Expo app/)');
  console.log('✓ Using React interface from client/src/App.tsx');
});