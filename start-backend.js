#!/usr/bin/env node

// Simple backend starter for testing
const { spawn } = require('child_process');

console.log('Starting Chirp backend server...');
console.log('Database URL available:', !!process.env.DATABASE_URL);

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    PORT: '3000',
    NODE_ENV: 'development'
  }
});

server.stdout.on('data', (data) => {
  console.log('[Backend]:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error('[Backend Error]:', data.toString().trim());
});

server.on('error', (error) => {
  console.error('Failed to start backend:', error);
});

server.on('exit', (code) => {
  console.log('Backend server exited with code:', code);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down backend server...');
  server.kill();
  process.exit();
});