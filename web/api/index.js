// Vercel serverless function for API routes
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'production',
      platform: 'vercel',
      url: req.url,
      method: req.method
    });
    return;
  }

  // Test endpoint
  if (req.url === '/api/test' || req.url === '/test') {
    res.status(200).json({
      message: 'Chirp API is working on Vercel!',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    });
    return;
  }

  // Default response for other API routes
  res.status(404).json({
    error: 'API endpoint not found',
    url: req.url,
    method: req.method,
    note: 'This is a Vercel serverless function'
  });
}
