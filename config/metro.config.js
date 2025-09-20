const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for path-to-regexp issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Exclude server files from web builds
config.resolver.blockList = [
  // Block server directory for web builds
  new RegExp(path.resolve(__dirname, 'server/.*')),
  // Block services directory for web builds  
  new RegExp(path.resolve(__dirname, 'services/.*')),
  // Block utils directory for web builds
  new RegExp(path.resolve(__dirname, 'utils/.*')),
];

module.exports = config;