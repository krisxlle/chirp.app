import { Request, Response, NextFunction } from "express";
import { Csrf } from "csrf";

// Create CSRF instance
const csrf = new Csrf();

// CSRF middleware for authentication endpoints
export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and OPTIONS requests
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return next();
  }

  // Skip CSRF for API routes that don't need it (like public endpoints)
  if (req.path.startsWith('/api/push-tokens') || 
      req.path.startsWith('/api/support') ||
      req.path.startsWith('/api/notifications')) {
    return next();
  }

  try {
    // Get CSRF token from header or body
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    
    if (!token) {
      return res.status(403).json({ 
        error: 'CSRF token missing',
        message: 'CSRF token is required for this request'
      });
    }

    // Verify CSRF token
    const secret = req.session?.csrfSecret || 'default-secret';
    if (!csrf.verify(secret, token)) {
      return res.status(403).json({ 
        error: 'Invalid CSRF token',
        message: 'CSRF token verification failed'
      });
    }

    next();
  } catch (error) {
    console.error('CSRF middleware error:', error);
    return res.status(500).json({ 
      error: 'CSRF verification failed',
      message: 'Internal server error during CSRF verification'
    });
  }
}

// Generate CSRF token for client
export function generateCsrfToken(req: Request): string {
  const secret = req.session?.csrfSecret || 'default-secret';
  return csrf.create(secret);
}

// Initialize CSRF secret in session
export function initCsrfSecret(req: Request): void {
  if (!req.session?.csrfSecret) {
    req.session.csrfSecret = csrf.secretSync();
  }
}
