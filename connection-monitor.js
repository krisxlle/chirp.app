#!/usr/bin/env node

const http = require('http');
const https = require('https');

class ConnectionMonitor {
  constructor() {
    this.intervalId = null;
    this.healthCheckInterval = 10000; // 10 seconds
    this.maxRetries = 3;
    this.baseUrl = 'http://localhost:5000';
  }

  start() {
    console.log('🔍 Starting connection monitor...');
    this.intervalId = setInterval(() => {
      this.checkHealth();
    }, this.healthCheckInterval);
    
    // Initial health check
    this.checkHealth();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️  Connection monitor stopped');
    }
  }

  async checkHealth() {
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(this.baseUrl);
      const responseTime = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        console.log(`✅ Health check passed (${responseTime}ms)`);
      } else {
        console.log(`⚠️  Health check warning: status ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
      this.handleConnectionFailure();
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Chirp-Connection-Monitor',
          'Connection': 'keep-alive'
        }
      }, (response) => {
        resolve(response);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
  }

  handleConnectionFailure() {
    console.log('🔄 Attempting to restore connection...');
    // In a real scenario, you might want to:
    // - Restart the server process
    // - Clear caches
    // - Reset network connections
    // For now, we'll just log the issue
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  const monitor = new ConnectionMonitor();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping connection monitor...');
    monitor.stop();
    process.exit(0);
  });

  monitor.start();
}

module.exports = ConnectionMonitor;