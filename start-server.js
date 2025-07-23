#!/usr/bin/env node

// Production-ready server startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Chirp server...');

// Use the main server entry point
const serverPath = path.join(__dirname, 'server/index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping server...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping server...');
  child.kill('SIGINT');
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});