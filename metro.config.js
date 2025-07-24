const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add minimal stability improvements
config.server = {
  ...config.server,
  port: 5000
};

// Optimize resolver for stability
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'webp', 'avif'],
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs']
};

// Improve build stability with minimal configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

module.exports = config;