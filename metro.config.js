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
  /server\/.*/,
  // Block utils directory for web builds (contains server-side code)
  /utils\/.*\.js/,
];

// Additional resolver configuration to prevent server imports
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
