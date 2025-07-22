#!/usr/bin/env node
// Script to start the React web client from client/ directory
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting React web client from client/ directory...');

// Run vite from the root directory but with client as the root
const viteProcess = spawn('npx', ['vite', '--root', 'client', '--port', '5000', '--host', '0.0.0.0'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

viteProcess.on('error', (err) => {
  console.error('Failed to start client:', err);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  console.log(`Client process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down React web client...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down React web client...');
  viteProcess.kill('SIGTERM');
});