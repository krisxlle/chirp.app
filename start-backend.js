#!/usr/bin/env node

// Start the backend API server on port 5001
// This allows the Expo mobile app to run on port 5000 and connect to the API on 5001

const { spawn } = require('child_process');

// Set the port to 5001 for the backend
process.env.PORT = '5001';

console.log('🚀 Starting Chirp Backend API Server on port 5001...');
console.log('📱 Mobile app should run on port 5000 and connect to this API');

// Start the server using tsx to run TypeScript directly
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5001',
    NODE_ENV: 'development'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down backend server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down backend server...');
  server.kill('SIGTERM');
});