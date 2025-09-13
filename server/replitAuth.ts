import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { csrfMiddleware, initCsrfSecret } from "./csrf";
import { authLimiter } from "./rateLimiting";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Setup session middleware with CSRF protection
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add CSRF middleware for all routes that modify state
  app.use(csrfMiddleware);
  
  // Setup basic session handling for development
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Simple login endpoint for development
  app.get("/api/login", authLimiter, (req, res) => {
    // Initialize CSRF secret in session
    initCsrfSecret(req);
    
    console.log('🔧 Development mode: Login endpoint accessed');
    return res.json({ 
      message: "Login endpoint - implement your authentication logic here",
      csrfToken: req.session?.csrfSecret ? require('./csrf').generateCsrfToken(req) : null
    });
  });

  // Simple logout endpoint
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // For development, allow all requests
  console.log('🔧 Development mode: Bypassing authentication check');
  return next();
};
