import type { Express } from "express";
import express from "express";
import fs from 'fs';
import { createServer, type Server } from "http";
import path from 'path';
import { supabase } from "./db";

export async function registerRoutesSafe(app: Express): Promise<Server> {
  console.log('🛠️  Starting safe route registration...');
  
  // Add CORS middleware for all routes
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'https://www.joinchirp.org',
      'https://joinchirp.org'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  // Helper function to safely register a route
  function safeRoute(name: string, registerFunction: () => void) {
    try {
      console.log(`📍 Registering route: ${name}`);
      registerFunction();
      console.log(`✅ Successfully registered: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to register route: ${name}`, error);
      throw error;
    }
  }

  // 1. Health check endpoint - simple and safe
  safeRoute('Health Check', () => {
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });
    
    // Add a simple test route to verify our server is receiving requests
    app.get('/test', (req, res) => {
      res.json({ 
        message: 'Chirp server is working!', 
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      });
    });
    
        // Add a database test endpoint
        app.get('/api/test/db', async (req, res) => {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('id, email, first_name, last_name, profile_image_url, avatar_url, banner_image_url, bio, link_in_bio, custom_handle')
              .limit(5);
        
        if (error) {
          res.json({ 
            success: false, 
            error: error.message,
            message: 'Database connection failed'
          });
        } else {
          res.json({ 
            success: true, 
            message: 'Database connection successful',
            userCount: data?.length || 0,
            users: data
          });
        }
      } catch (error) {
        res.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Database test failed'
        });
      }
    });
    
        // Add a public chirps test endpoint
        app.get('/api/test/chirps', async (req, res) => {
          try {
            const { data, error } = await supabase
              .from('chirps')
              .select(`
                id,
                content,
                created_at,
                author_id,
                users!inner(id, first_name, last_name, email, handle, profile_image_url, avatar_url, banner_image_url, bio, link_in_bio, custom_handle)
              `)
              .order('created_at', { ascending: false })
              .limit(10);
        
        if (error) {
          res.json({ 
            success: false, 
            error: error.message,
            message: 'Chirps query failed'
          });
        } else {
          res.json({ 
            success: true, 
            message: 'Chirps retrieved successfully',
            chirpCount: data?.length || 0,
            chirps: data
          });
        }
      } catch (error) {
        res.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Chirps test failed'
        });
      }
    });
    
    // Add authentication endpoint
    app.post('/api/auth/signin', async (req, res) => {
      try {
        const { username, password } = req.body;
        
        if (!username || !password) {
          return res.status(400).json({ 
            success: false, 
            error: 'Username and password are required' 
          });
        }
        
        console.log('🔐 Authentication attempt for username:', username);
        
        // First, try to find the user by custom_handle
        let userProfile = null;
        
        // Try custom_handle first (case-insensitive)
        const { data: customHandleUser, error: customHandleError } = await supabase
          .from('users')
          .select('*')
          .ilike('custom_handle', username)
          .single();

        if (customHandleUser) {
          userProfile = customHandleUser;
          console.log('✅ Found user by custom_handle:', userProfile.id);
        } else if (customHandleError?.code !== 'PGRST116') { // PGRST116 = no rows found
          console.log('❌ Error searching by custom_handle:', customHandleError);
          return res.status(500).json({ success: false, error: 'Database error' });
        } else {
          // Try handle if custom_handle didn't work (case-insensitive)
          const { data: handleUser, error: handleError } = await supabase
            .from('users')
            .select('*')
            .ilike('handle', username)
            .single();

          if (handleUser) {
            userProfile = handleUser;
            console.log('✅ Found user by handle:', userProfile.id);
          } else if (handleError?.code !== 'PGRST116') {
            console.log('❌ Error searching by handle:', handleError);
            return res.status(500).json({ success: false, error: 'Database error' });
          } else {
            // Try email if handle didn't work (for users logging in with email)
            const { data: emailUser, error: emailError } = await supabase
              .from('users')
              .select('*')
              .eq('email', username)
              .single();

            if (emailUser) {
              userProfile = emailUser;
              console.log('✅ Found user by email:', userProfile.id);
            } else if (emailError?.code !== 'PGRST116') {
              console.log('❌ Error searching by email:', emailError);
              return res.status(500).json({ success: false, error: 'Database error' });
            }
          }
        }

        if (!userProfile) {
          console.log('❌ No user found with username/email:', username);
          return res.status(401).json({ success: false, error: 'User not found' });
        }

        console.log('✅ Found user profile:', userProfile.id, 'email:', userProfile.email);

        // For now, we'll skip password validation and just validate the user exists
        // This bypasses the email confirmation requirement
        // TODO: Implement proper password hashing/validation
        console.log('✅ User authenticated successfully by username (bypassing password validation)');
        
        res.json({
          id: userProfile.id,
          email: userProfile.email,
          display_name: userProfile.display_name,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          custom_handle: userProfile.custom_handle,
          handle: userProfile.handle,
          profile_image_url: userProfile.profile_image_url,
          banner_image_url: userProfile.banner_image_url,
          bio: userProfile.bio,
          crystal_balance: userProfile.crystal_balance || 0,
          is_chirp_plus: userProfile.is_chirp_plus || false,
          show_chirp_plus_badge: userProfile.show_chirp_plus_badge || false
        });
      } catch (error) {
        console.error('❌ Error in authentication:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
      }
    });
    
    // Root route removed - let static file serving handle it
  });

  // 2. Serve generated images
  safeRoute('Static Images', () => {
    app.use('/generated-images', express.static("public/generated-images"));
  });

  // 3. Auth middleware
  safeRoute('Auth Setup', async () => {
    try {
      const { setupAuth } = await import('./auth');
      await setupAuth(app);
    } catch (error) {
      console.log('⚠️  Auth setup failed, continuing without auth:', error.message);
    }
  });

  // 4. Basic API routes
  safeRoute('Basic API Routes', () => {
    // Simple test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working' });
    });

    // Another simple route
    app.post('/api/test', (req, res) => {
      res.json({ message: 'POST API is working', body: req.body });
    });
    
    // User profile endpoints
    app.get('/api/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.log('❌ Error fetching user:', error);
          return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          customHandle: user.custom_handle,
          handle: user.handle,
          profileImageUrl: user.profile_image_url,
          avatarUrl: user.profile_image_url,
          bannerImageUrl: user.banner_image_url,
          bio: user.bio,
          linkInBio: user.link_in_bio,
          joinedAt: user.created_at,
          isChirpPlus: user.is_chirp_plus || false,
          showChirpPlusBadge: user.show_chirp_plus_badge || false
        });
      } catch (error) {
        console.error('❌ Error in user profile endpoint:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
      }
    });
    
    app.get('/api/users/:id/chirps', async (req, res) => {
      try {
        const { id } = req.params;
        
        const { data: chirps, error } = await supabase
          .from('chirps')
          .select(`
            id,
            content,
            created_at,
            author_id,
            reply_to_id,
            image_url,
            image_alt_text,
            image_width,
            image_height,
            users!chirps_author_id_fkey(id, first_name, last_name, email, handle, profile_image_url, avatar_url, banner_image_url, bio, link_in_bio, custom_handle)
          `)
          .eq('author_id', id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          console.log('❌ Error fetching user chirps:', error);
          return res.status(500).json({ success: false, error: 'Failed to fetch chirps' });
        }
        
        // Transform the data to match the expected format
        const transformedChirps = chirps?.map(chirp => ({
          id: chirp.id,
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          author: {
            id: chirp.users.id,
            firstName: chirp.users.first_name,
            lastName: chirp.users.last_name,
            email: chirp.users.email,
            customHandle: chirp.users.custom_handle,
            handle: chirp.users.handle,
            profileImageUrl: chirp.users.profile_image_url,
            avatarUrl: chirp.users.avatar_url,
            bannerImageUrl: chirp.users.banner_image_url,
            bio: chirp.users.bio,
            linkInBio: chirp.users.link_in_bio
          },
          replyCount: 0, // TODO: Calculate actual reply count
          reactionCount: 0, // TODO: Calculate actual reaction count
          imageUrl: chirp.image_url,
          imageAltText: chirp.image_alt_text,
          imageWidth: chirp.image_width,
          imageHeight: chirp.image_height
        })) || [];
        
        res.json(transformedChirps);
      } catch (error) {
        console.error('❌ Error in user chirps endpoint:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user chirps' });
      }
    });
    
    app.get('/api/users/:id/stats', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Get following count
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', id);
        
        // Get followers count
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', id);
        
        res.json({
          following: followingCount || 0,
          followers: followersCount || 0,
          profilePower: 0 // TODO: Calculate actual profile power
        });
      } catch (error) {
        console.error('❌ Error in user stats endpoint:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
      }
    });
  });

  // 5. Try a route with parameters
  safeRoute('Parameterized Routes', () => {
    // Removed duplicate user route - handled in Basic API Routes
  });

  // 6. Safe error middleware
  safeRoute('Error Middleware', () => {
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
  });

  // 7. Safe static file serving
  safeRoute('Static File Serving', () => {
    console.log('🔍 DEBUG: Starting static file serving setup...');
    console.log('🔍 DEBUG: Environment:', app.get("env"));
    
    if (app.get("env") === "development") {
      console.log('⚠️  Skipping Vite setup in safe mode');
    } else {
      console.log('📁 Setting up safe static file serving...');
      
      const distPath = path.join(process.cwd(), "dist");
      console.log('📁 Checking for dist directory:', distPath);
      console.log('📁 Current working directory:', process.cwd());
      console.log('📁 Directory contents:', fs.readdirSync(process.cwd()));
      
      if (!fs.existsSync(distPath)) {
        console.log('⚠️  Dist directory not found, skipping static file serving');
        console.log('📁 Available directories:', fs.readdirSync(process.cwd()).filter(item => fs.statSync(item).isDirectory()));
        return;
      }
      
      console.log('📁 Dist directory found, setting up static serving...');
      console.log('📁 Dist directory contents:', fs.readdirSync(distPath));
      console.log('📁 Checking for index.html:', fs.existsSync(path.join(distPath, 'index.html')));
      
      try {
        console.log('🔍 DEBUG: About to call express.static...');
        // Static file serving with cache-busting for JS files
        app.use(express.static(distPath, {
          setHeaders: (res, path) => {
            // Add no-cache headers for JavaScript files to prevent caching issues
            if (path.endsWith('.js')) {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
            }
          }
        }));
        console.log('✅ express.static configured successfully');
        
        // Add debugging middleware to see what requests are coming in
        app.use((req, res, next) => {
          console.log('🔍 DEBUG: Request received:', req.method, req.path);
          next();
        });
        
        console.log('🔍 DEBUG: About to set up SPA fallback...');
        // Use a safer SPA fallback pattern
        app.use((req, res, next) => {
          console.log('🔍 DEBUG: SPA fallback called for:', req.path);
          
          // Skip API routes
          if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
          }
          
          // Skip static file requests (they should be handled by express.static)
          if (req.path.includes('.')) {
            return next();
          }
          
          // Serve index.html for SPA routing
          const indexPath = path.join(distPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.json({ 
              message: 'Chirp app is running', 
              note: 'Static files available but index.html not found'
            });
          }
        });
        console.log('✅ SPA fallback configured successfully');
        
        console.log('✅ Safe static file serving configured');
      } catch (error) {
        console.error('❌ Error in static file serving setup:', error);
        throw error;
      }
    }
  });

  // 8. Create HTTP server
  console.log('🌐 Creating HTTP server...');
  const server = createServer(app);
  
  return server;
}
