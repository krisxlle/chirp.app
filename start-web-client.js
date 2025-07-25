#!/usr/bin/env node

// Start the web client using Vite
const { spawn } = require('child_process');
const path = require('path');

console.log('🌐 Starting Chirp Web Client...');

// Change to client directory and start vite dev server
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

viteProcess.on('error', (error) => {
  console.error('❌ Error starting web client:', error);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Web client exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping web client...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
});