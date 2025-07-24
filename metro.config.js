const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure Metro to handle additional asset types and directories
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

// Add public directory as an asset source
config.resolver.alias = {
  ...config.resolver.alias,
  '@assets': path.resolve(__dirname, 'assets'),
  '@generated': path.resolve(__dirname, 'public/generated-images'),
};

// Configure web-specific settings
if (config.web) {
  config.web.assetPlugins = [...(config.web.assetPlugins || [])];
}

module.exports = config;