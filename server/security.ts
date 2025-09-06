import { NextFunction, Request, Response } from "express";
import { truncateSensitiveData } from "./loggingUtils";

// Security middleware to protect against unauthorized access
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const userAgent = req.get('User-Agent');
  
  // Log suspicious requests for monitoring
  if (origin && !isAllowedOrigin(origin)) {
    console.warn(`🚨 SECURITY ALERT: Unauthorized origin attempt`, {
      origin,
      referer,
      userAgent,
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    // Block the request
    return res.status(403).json({
      error: 'Access denied',
      message: 'Unauthorized origin'
    });
  }
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

// Check if origin is allowed
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    // Add your computer's IP for mobile testing
    process.env.COMPUTER_IP ? `http://${process.env.COMPUTER_IP}:5000` : null,
    process.env.COMPUTER_IP ? `http://${process.env.COMPUTER_IP}:3000` : null,
  ].filter(Boolean);
  
  return allowedOrigins.includes(origin);
}

// Development server protection middleware
export function devServerProtection(req: Request, res: Response, next: NextFunction) {
  // Only apply in development mode
  if (process.env.NODE_ENV === 'production') {
    return next();
  }
  
  const path = req.path;
  const origin = req.get('Origin');
  
  // Block access to sensitive development files
  const sensitivePaths = [
    '/src/',
    '/node_modules/',
    '/.env',
    '/.git/',
    '/package.json',
    '/package-lock.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/esbuild',
  ];
  
  if (sensitivePaths.some(sensitivePath => path.includes(sensitivePath))) {
    // Allow access only from allowed origins
    if (!origin || !isAllowedOrigin(origin)) {
      console.warn(`🚨 SECURITY ALERT: Blocked access to sensitive path`, {
        path,
        origin,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Sensitive development files are not accessible'
      });
    }
  }
  
  next();
}

// Request logging middleware for security monitoring
export function securityLogging(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const origin = req.get('Origin');
    
    // Log suspicious patterns
    if (origin && !isAllowedOrigin(origin)) {
      console.warn(`🚨 SUSPICIOUS REQUEST`, {
        method: req.method,
        path: req.path,
        origin: truncateSensitiveData(origin),
        ip: req.ip,
        userAgent: truncateSensitiveData(req.get('User-Agent') || ''),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log requests to sensitive endpoints
    if (req.path.includes('/esbuild') || req.path.includes('/src/')) {
      console.log(`🔍 DEV SERVER ACCESS`, {
        method: req.method,
        path: req.path,
        origin: truncateSensitiveData(origin || 'no-origin'),
        ip: req.ip,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
}
