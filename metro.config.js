const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Set Expo development server port
config.server = {
  ...config.server,
  port: 8081
};

// Add proxy middleware for API requests
config.server.enhanceMiddleware = (middleware, server) => {
  return (req, res, next) => {
    // Proxy API requests to backend server
    if (req.url.startsWith('/api/')) {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: req.url,
        method: req.method,
        headers: req.headers
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500);
        res.end('Proxy error');
      });

      if (req.body) {
        proxyReq.write(req.body);
      }
      proxyReq.end();
      return;
    }
    return middleware(req, res, next);
  };
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