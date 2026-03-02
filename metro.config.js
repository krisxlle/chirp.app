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

// Force @supabase/postgrest-js to CJS so Metro can resolve it (avoids "Unable to resolve" on web)
const forcedCjsResolutions = {
  '@supabase/postgrest-js': path.join(__dirname, 'node_modules', '@supabase', 'postgrest-js', 'dist', 'cjs', 'index.js'),
};
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (forcedCjsResolutions[moduleName]) {
    return { filePath: forcedCjsResolutions[moduleName], type: 'sourceFile' };
  }
  return defaultResolveRequest ? defaultResolveRequest(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
