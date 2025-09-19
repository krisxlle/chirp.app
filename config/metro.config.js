const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for path-to-regexp issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config;