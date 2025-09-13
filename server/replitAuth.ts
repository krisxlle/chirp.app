import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import memoize from "memoizee";
import passport from "passport";
import { authLimiter } from "./rateLimiting";
import { storage } from "./storage";
import { csrfMiddleware, initCsrfSecret } from "./csrf";

// Make REPLIT_DOMAINS optional for local development
const isReplitEnvironment = process.env.REPLIT_DOMAINS && process.env.NODE_ENV === 'production';

if (isReplitEnvironment && !process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

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

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only setup Replit authentication if we're in a Replit environment
  if (!isReplitEnvironment) {
    console.log('🔧 Development mode: Skipping Replit authentication setup');
    
    // Setup basic session handling for development
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", authLimiter, (req, res, next) => {
    // Initialize CSRF secret in session
    initCsrfSecret(req);
    
    // In development mode, just redirect to home
    if (!isReplitEnvironment) {
      console.log('🔧 Development mode: Skipping login, redirecting to home');
      return res.redirect("/");
    }

    // Get the correct hostname - use the first domain from REPLIT_DOMAINS for localhost
    const hostname = req.hostname === 'localhost' 
      ? process.env.REPLIT_DOMAINS!.split(",")[0]
      : req.hostname;
    
    console.log('Login attempt for hostname:', hostname, ', strategy: replitauth:' + hostname);
    console.log('Available domains:', process.env.REPLIT_DOMAINS);
    console.log('Request hostname:', req.hostname);
    
    // Verify strategy exists
    const strategy = passport._strategy(`replitauth:${hostname}`);
    if (!strategy) {
      console.error(`Strategy not found: replitauth:${hostname}`);
      return res.status(500).json({ message: "Authentication strategy not configured" });
    }
    
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", authLimiter, csrfMiddleware, (req, res, next) => {
    // In development mode, just redirect to home
    if (!isReplitEnvironment) {
      console.log('🔧 Development mode: Skipping callback, redirecting to home');
      return res.redirect("/");
    }

    // Get the correct hostname - use the first domain from REPLIT_DOMAINS for localhost
    const hostname = req.hostname === 'localhost' 
      ? process.env.REPLIT_DOMAINS!.split(",")[0]
      : req.hostname;
    
    console.log('Callback attempt for hostname:', hostname, ', strategy: replitauth:' + hostname);
    
    passport.authenticate(`replitauth:${hostname}`, (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ message: "Authentication failed", error: err.message });
      }
      
      if (!user) {
        console.error('Authentication failed - no user:', info);
        return res.redirect("/api/login");
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).json({ message: "Login failed", error: loginErr.message });
        }
        console.log('Authentication successful for user');
        return res.redirect("/");
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    // In development mode, just redirect to home
    if (!isReplitEnvironment) {
      console.log('🔧 Development mode: Skipping logout, redirecting to home');
      return res.redirect("/");
    }

    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development mode, always allow access
  if (!isReplitEnvironment) {
    console.log('🔧 Development mode: Bypassing authentication check');
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
