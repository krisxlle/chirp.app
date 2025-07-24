#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false));
    }).on('error', () => resolve(true));
  });
}

async function startImageServer() {
  const port = 8080;
  const isPortInUse = await checkPort(port);
  
  if (isPortInUse) {
    console.log(`Port ${port} is already in use, skipping image server start`);
    return;
  }

  console.log(`Starting image server on port ${port}...`);
  
  // Start Python HTTP server
  const server = spawn('python3', ['-m', 'http.server', port.toString()], {
    cwd: path.join(__dirname, 'public'),
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    console.log(`Image server: ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.log(`Image server error: ${data.toString().trim()}`);
  });

  server.on('close', (code) => {
    console.log(`Image server exited with code ${code}`);
  });

  // Give it time to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test the server
  try {
    const testReq = http.get(`http://localhost:${port}/generated-images/`, (res) => {
      console.log(`Image server test: ${res.statusCode}`);
    });
    testReq.on('error', (err) => {
      console.log('Image server test failed:', err.message);
    });
  } catch (error) {
    console.log('Could not test image server:', error.message);
  }
}

if (require.main === module) {
  startImageServer().catch(console.error);
}

module.exports = { startImageServer };