#!/usr/bin/env node

// Development server runner for the full-stack application
// This script bridges the gap between the Expo configuration and the expected Express server

const { spawn } = require('child_process');
const path = require('path');

// Check if we should run the Express server or Expo web
const runExpressServer = () => {
  console.log('Starting Express server with TSX for original web client...');
  
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '5000'
    }
  });

  server.on('error', (error) => {
    console.error('Failed to start Express server:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log('Express server exited with code:', code);
    process.exit(code);
  });
};

const runExpoWeb = () => {
  console.log('Starting Expo web server on port 5000...');
  
  const expo = spawn('npm', ['run', 'web'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_CLI_ARGS: '--port 5000'
    }
  });

  expo.on('error', (error) => {
    console.error('Failed to start Expo web:', error);
    process.exit(1);
  });

  expo.on('exit', (code) => {
    console.log('Expo web server exited with code:', code);
    process.exit(code);
  });
};

// Run Express server directly for original web client
runExpressServer();