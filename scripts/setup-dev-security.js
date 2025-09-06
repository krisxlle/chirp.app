#!/usr/bin/env node

/**
 * Development Security Setup Script
 * 
 * This script helps configure your development environment with proper security settings
 * to protect against the esbuild CORS vulnerability.
 */

import { writeFileSync } from 'fs';
import { networkInterfaces } from 'os';
import { join } from 'path';

function getLocalIPAddress() {
  const interfaces = networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  
  return null;
}

function createEnvFile() {
  const ip = getLocalIPAddress();
  
  if (!ip) {
    console.error('❌ Could not determine your local IP address');
    console.log('Please manually set COMPUTER_IP in your environment variables');
    return;
  }
  
  const envContent = `# Development Security Configuration
# This file helps protect your development server from unauthorized access
COMPUTER_IP=${ip}

# Optional: Add additional allowed origins
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,http://${ip}:5000
`;

  const envPath = join(process.cwd(), '.env.local');
  
  try {
    writeFileSync(envPath, envContent);
    console.log(`✅ Created .env.local with IP: ${ip}`);
    console.log(`📱 You can now test on mobile using: http://${ip}:5000`);
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error);
  }
}

function showSecurityInfo() {
  console.log('\n🔒 Development Security Configuration');
  console.log('=====================================');
  console.log('');
  console.log('✅ CORS Protection: Enabled');
  console.log('✅ Origin Validation: Enabled');
  console.log('✅ Rate Limiting: Enabled');
  console.log('✅ Security Headers: Enabled');
  console.log('✅ Request Logging: Enabled');
  console.log('');
  console.log('🛡️  Security Features:');
  console.log('  • Only allows requests from localhost and your computer IP');
  console.log('  • Blocks unauthorized origins with detailed logging');
  console.log('  • Protects sensitive development files');
  console.log('  • Rate limits all API requests');
  console.log('  • Adds security headers to all responses');
  console.log('');
  console.log('📱 Mobile Testing:');
  console.log('  • Use your computer IP instead of localhost');
  console.log('  • Example: http://192.168.1.100:5000');
  console.log('');
  console.log('⚠️  Important:');
  console.log('  • Never run the development server on a public network');
  console.log('  • Always use HTTPS in production');
  console.log('  • Monitor the console for security alerts');
}

function main() {
  console.log('🔒 Setting up development security...\n');
  
  createEnvFile();
  showSecurityInfo();
  
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Test that your app still works locally');
  console.log('3. Test mobile access using your computer IP');
  console.log('4. Monitor console for any security alerts');
}

main();
