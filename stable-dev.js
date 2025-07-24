#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting stable Expo development server...');

// Environment variables for stability
process.env.EXPO_NO_TELEMETRY = '1';
process.env.EXPO_NO_UPDATE_CHECK = '1';
process.env.EXPO_OFFLINE = '0';
process.env.EXPO_DEVTOOLS_LISTEN_ADDRESS = '0.0.0.0';

// Enhanced server stability settings
const expoArgs = [
  'start',
  '--web',
  '--port', '5000',
  '--no-dev-client',
  '--no-minify',
  '--offline',
  '--clear'
];

let serverProcess;
let restartCount = 0;
const MAX_RESTARTS = 10;

function startServer() {
  console.log(`📡 Starting Expo server (attempt ${restartCount + 1}/${MAX_RESTARTS})`);
  
  serverProcess = spawn('npx', ['expo', ...expoArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Additional stability environment variables
      NODE_OPTIONS: '--max-old-space-size=4096',
      WATCHPACK_POLLING: 'true',
      CHOKIDAR_USEPOLLING: 'true',
      CHOKIDAR_INTERVAL: '1000'
    }
  });

  serverProcess.on('close', (code) => {
    console.log(`\n⚠️  Server exited with code ${code}`);
    
    if (code !== 0 && restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`🔄 Restarting server in 3 seconds... (${restartCount}/${MAX_RESTARTS})`);
      setTimeout(startServer, 3000);
    } else if (restartCount >= MAX_RESTARTS) {
      console.log('❌ Max restart attempts reached. Please check for issues.');
      process.exit(1);
    } else {
      console.log('✅ Server stopped gracefully');
      process.exit(0);
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`🔄 Restarting due to error... (${restartCount}/${MAX_RESTARTS})`);
      setTimeout(startServer, 3000);
    }
  });

  // Reset restart count on successful startup
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      restartCount = 0;
      console.log('✅ Server running stably, reset restart counter');
    }
  }, 30000); // Reset after 30 seconds of stable operation
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Start the server
startServer();