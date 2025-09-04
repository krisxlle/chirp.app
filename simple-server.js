// Simple Express server to serve the built application
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Add database support for push tokens
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon database
const neonConfig = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

const app = express();
const port = process.env.PORT || 4000;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
let pool = null;
let isConnected = false;

// Initialize database connection
async function initDatabase() {
  try {
    if (DATABASE_URL && !DATABASE_URL.includes('dummy')) {
      pool = new Pool({ connectionString: DATABASE_URL });
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      isConnected = true;
      console.log('✅ Database connected successfully');
      
      // Fix users with email as ID
      await fixUserIds();
    } else {
      console.log('⚠️  No DATABASE_URL provided, running in mock mode');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Running in mock mode without database');
  }
}

// Fix users who have email addresses as their IDs
async function fixUserIds() {
  try {
    console.log('🔧 Checking for users with email as ID...');
    
    // Find users where id is not a UUID
    const { rows: usersToFix } = await pool.query(
      `SELECT id, email FROM users WHERE id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'`
    );
    
    if (usersToFix.length > 0) {
      console.log(`🔧 Found ${usersToFix.length} users with invalid IDs, fixing...`);
      
      for (const user of usersToFix) {
        const newId = crypto.randomUUID();
        console.log(`🔧 Updating user ${user.email}: ${user.id} -> ${newId}`);
        
        // Update the user's ID
        await pool.query(
          `UPDATE users SET id = $1 WHERE email = $2`,
          [newId, user.email]
        );
      }
      
      console.log('✅ User IDs fixed successfully');
    } else {
      console.log('✅ All users have valid UUIDs');
    }
    
    // Sync users to Supabase
    await syncUsersToSupabase();
  } catch (error) {
    console.error('❌ Error fixing user IDs:', error);
  }
}

// Sync users from Neon to Supabase
async function syncUsersToSupabase() {
  try {
    console.log('🔄 Syncing users from Neon to Supabase...');
    const { rows: users } = await pool.query(`SELECT * FROM users`);
    
    const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    for (const user of users) {
      try {
        console.log(`🔍 Checking user ${user.email} (ID: ${user.id}) in Supabase...`);
        
        // First check if user exists in Supabase by ID
        const checkByIdResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        console.log(`📡 Check by ID response status: ${checkByIdResponse.status}`);
        
        if (checkByIdResponse.ok) {
          const existingUsersById = await checkByIdResponse.json();
          console.log(`📊 Found ${existingUsersById.length} existing users by ID in Supabase`);
          
          if (existingUsersById.length > 0) {
            // User exists by ID, update it
            console.log(`🔄 Updating existing user ${user.email} in Supabase...`);
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({
                email: user.email,
                first_name: user.first_name,
                custom_handle: user.custom_handle,
                handle: user.handle,
                created_at: user.created_at
              })
            });
            
            console.log(`📡 Update response status: ${updateResponse.status}`);
            
            if (updateResponse.ok) {
              console.log(`✅ Updated user ${user.email} in Supabase`);
            } else {
              const errorText = await updateResponse.text();
              console.log(`⚠️ Failed to update user ${user.email} in Supabase: ${errorText}`);
            }
          } else {
            // User doesn't exist by ID, check by custom_handle
            console.log(`🔍 Checking if user exists by custom_handle: ${user.custom_handle}...`);
            const checkByHandleResponse = await fetch(`${supabaseUrl}/rest/v1/users?custom_handle=eq.${user.custom_handle}`, {
              method: 'GET',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            });
            
            if (checkByHandleResponse.ok) {
              const existingUsersByHandle = await checkByHandleResponse.json();
              console.log(`📊 Found ${existingUsersByHandle.length} existing users by handle in Supabase`);
              
              if (existingUsersByHandle.length > 0) {
                // User exists by handle but different ID, update the existing user's ID
                const existingUser = existingUsersByHandle[0];
                console.log(`🔄 Updating existing user ${existingUser.email} with new ID: ${user.id}...`);
                
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${existingUser.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                  },
                  body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    custom_handle: user.custom_handle,
                    handle: user.handle,
                    created_at: user.created_at
                  })
                });
                
                console.log(`📡 Update response status: ${updateResponse.status}`);
                
                if (updateResponse.ok) {
                  console.log(`✅ Updated user ${user.email} in Supabase with new ID`);
                } else {
                  const errorText = await updateResponse.text();
                  console.log(`⚠️ Failed to update user ${user.email} in Supabase: ${errorText}`);
                }
              } else {
                // No user exists by handle, create new user
                await createUserInSupabase(user, supabaseUrl, supabaseKey);
              }
            } else {
              // Check failed, try to create user
              await createUserInSupabase(user, supabaseUrl, supabaseKey);
            }
          }
        } else {
          const errorText = await checkByIdResponse.text();
          console.log(`⚠️ Failed to check user ${user.email} in Supabase: ${errorText}`);
        }
      } catch (error) {
        console.log(`⚠️ Error syncing user ${user.email}:`, error.message);
      }
    }
    
    console.log('✅ User sync completed');
  } catch (error) {
    console.error('❌ Error syncing users to Supabase:', error);
  }
}

// Helper function to create user in Supabase
async function createUserInSupabase(user, supabaseUrl, supabaseKey) {
  console.log(`🆕 Creating new user ${user.email} in Supabase...`);
  const userData = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    custom_handle: user.custom_handle,
    handle: user.handle,
    created_at: user.created_at
  };
  
  console.log(`📤 Sending user data:`, userData);
  
  const createResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify(userData)
  });
  
  console.log(`📡 Create response status: ${createResponse.status}`);
  
  if (createResponse.ok) {
    console.log(`✅ Created user ${user.email} in Supabase`);
  } else {
    const errorText = await createResponse.text();
    console.log(`⚠️ Failed to create user ${user.email} in Supabase: ${errorText}`);
  }
}

// Add request parsing middleware with better error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', buf.toString());
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Authentication endpoint hit!');
  try {
    console.log('Received login request:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (isConnected && pool) {
      // Check user credentials in database
      try {
        const { rows } = await pool.query(
          `SELECT * FROM users WHERE email = $1 LIMIT 1`,
          [email]
        );
        
        if (rows.length > 0) {
          const user = rows[0];
          console.log('✅ User found:', user.email);
          
          // Verify password
          if (user.password_hash) {
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
              console.log('❌ Password mismatch for user:', user.email);
              return res.status(401).json({ error: 'Invalid email or password' });
            }
          } else {
            // For existing users without password_hash, accept any password for now
            console.log('⚠️  User has no password hash, accepting any password');
          }
          
          res.json({ 
            success: true, 
            user: {
              id: user.id,
              email: user.email,
              name: user.first_name || user.custom_handle || user.handle || email.split('@')[0],
              firstName: user.first_name,
              lastName: user.last_name,
              customHandle: user.custom_handle,
              handle: user.handle,
              profileImageUrl: user.profile_image_url,
              avatarUrl: user.profile_image_url,
              bannerImageUrl: user.banner_image_url,
              bio: user.bio
            }
          });
        } else {
          // User not found - return error for production
          console.log('❌ User not found:', email);
          res.status(401).json({ error: 'Invalid email or password' });
        }
      } catch (dbError) {
        console.error('❌ Database error during login:', dbError);
        res.status(500).json({ error: 'Authentication service unavailable' });
      }
    } else {
      // Database not connected - return error for production
      res.status(503).json({ error: 'Authentication service unavailable' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Sign-up endpoint
app.post('/api/auth/signup', async (req, res) => {
  console.log('📝 Sign-up endpoint hit!');
  try {
    console.log('Received signup request:', req.body);
    
    const { email, password, name, customHandle } = req.body;
    
    if (!email || !password || !name || !customHandle) {
      return res.status(400).json({ error: 'Email, password, name, and custom handle are required' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Custom handle validation
    if (customHandle.length < 3) {
      return res.status(400).json({ error: 'Custom handle must be at least 3 characters long' });
    }
    
    if (customHandle.length > 20) {
      return res.status(400).json({ error: 'Custom handle must be less than 20 characters' });
    }
    
    // Check for valid characters in handle (alphanumeric, hyphen, period)
    const handleRegex = /^[a-zA-Z0-9.-]+$/;
    if (!handleRegex.test(customHandle.replace('@', ''))) {
      return res.status(400).json({ error: 'Custom handle can only contain letters, numbers, hyphens, and periods' });
    }
    
    if (isConnected && pool) {
      try {
        // Check if user already exists (email or handle)
        const { rows: existingUsers } = await pool.query(
          `SELECT * FROM users WHERE email = $1 OR custom_handle = $2 LIMIT 1`,
          [email, customHandle]
        );
        
        if (existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          if (existingUser.email === email) {
            return res.status(400).json({ error: 'An account with this email already exists' });
          } else {
            return res.status(400).json({ error: 'This custom handle is already taken' });
          }
        }
        
        // Generate a unique handle if not provided
        const handle = customHandle.replace('@', '');
        
        // Create new user
        console.log('📝 Creating new user:', email);
        
        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Generate a UUID for the user ID
        const userId = crypto.randomUUID();
        
        const { rows: newUser } = await pool.query(
          `INSERT INTO users (id, email, first_name, custom_handle, handle, password_hash, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
           RETURNING *`,
          [userId, email, name, customHandle, handle, passwordHash]
        );
        
        console.log('✅ New user created:', newUser[0].email);
        
        // Also create user in Supabase for chirp creation
        try {
          const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
          const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
          
          const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              id: userId,
              email: email,
              first_name: name,
              custom_handle: customHandle,
              handle: handle,
              created_at: new Date().toISOString()
            })
          });
          
          if (supabaseResponse.ok) {
            console.log('✅ User also created in Supabase');
          } else {
            console.log('⚠️ Failed to create user in Supabase, but user exists in Neon DB');
          }
        } catch (supabaseError) {
          console.log('⚠️ Error creating user in Supabase:', supabaseError.message);
        }
        
        res.json({ 
          success: true, 
          message: 'Account created successfully',
          user: {
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].first_name || newUser[0].custom_handle || newUser[0].handle,
            firstName: newUser[0].first_name,
            lastName: newUser[0].last_name,
            customHandle: newUser[0].custom_handle,
            handle: newUser[0].handle,
            profileImageUrl: newUser[0].profile_image_url,
            avatarUrl: newUser[0].profile_image_url,
            bannerImageUrl: newUser[0].banner_image_url,
            bio: newUser[0].bio
          }
        });
      } catch (dbError) {
        console.error('❌ Database error during signup:', dbError);
        res.status(500).json({ error: 'Failed to create account. Please try again.' });
      }
    } else {
      // Database not connected - return error for production
      res.status(503).json({ error: 'Account creation service unavailable' });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// API routes - define these early
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Application server is running', 
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'mock mode'
  });
});

// Delete user endpoint (for testing)
app.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  console.log('🗑️ Deleting user:', email);
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);
    if (rows.length > 0) {
      console.log('✅ User deleted:', email);
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete all users endpoint (for testing)
app.delete('/api/users', async (req, res) => {
  console.log('🗑️ Deleting ALL users from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM users RETURNING *');
    console.log(`✅ Deleted ${rows.length} users from database`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${rows.length} users`,
      deletedCount: rows.length
    });
  } catch (error) {
    console.error('❌ Error deleting all users:', error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// Delete all chirps endpoint (for testing)
app.delete('/api/chirps', async (req, res) => {
  console.log('🗑️ Deleting ALL chirps from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM chirps RETURNING *');
    console.log(`✅ Deleted ${rows.length} chirps from database`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${rows.length} chirps`,
      deletedCount: rows.length
    });
  } catch (error) {
    console.error('❌ Error deleting all chirps:', error);
    res.status(500).json({ error: 'Failed to delete chirps' });
  }
});

// Delete all reactions endpoint (for testing)
app.delete('/api/reactions', async (req, res) => {
  console.log('🗑️ Deleting ALL reactions from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM reactions RETURNING *');
    console.log(`✅ Deleted ${rows.length} reactions from database`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${rows.length} reactions`,
      deletedCount: rows.length
    });
  } catch (error) {
    console.error('❌ Error deleting all reactions:', error);
    res.status(500).json({ error: 'Failed to delete reactions' });
  }
});

// Delete all notifications endpoint (for testing)
app.delete('/api/notifications', async (req, res) => {
  console.log('🗑️ Deleting ALL notifications from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM notifications RETURNING *');
    console.log(`✅ Deleted ${rows.length} notifications from database`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${rows.length} notifications`,
      deletedCount: rows.length
    });
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

// Delete all weekly summaries endpoint (for testing)
app.delete('/api/weekly-summaries', async (req, res) => {
  console.log('🗑️ Deleting ALL weekly summaries from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const { rows } = await pool.query('DELETE FROM weekly_summaries RETURNING *');
    console.log(`✅ Deleted ${rows.length} weekly summaries from database`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${rows.length} weekly summaries`,
      deletedCount: rows.length
    });
  } catch (error) {
    console.error('❌ Error deleting all weekly summaries:', error);
    res.status(500).json({ error: 'Failed to delete weekly summaries' });
  }
});

// Clear all chirp-related data endpoint (for testing)
app.delete('/api/chirp-data', async (req, res) => {
  console.log('🗑️ Clearing ALL chirp-related data from database');
  
  if (!isConnected || !pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    // Delete in order to respect foreign key constraints
    const reactionsResult = await pool.query('DELETE FROM reactions RETURNING *');
    const notificationsResult = await pool.query('DELETE FROM notifications RETURNING *');
    const weeklySummariesResult = await pool.query('DELETE FROM weekly_summaries RETURNING *');
    const chirpsResult = await pool.query('DELETE FROM chirps RETURNING *');
    
    const totalDeleted = reactionsResult.rows.length + notificationsResult.rows.length + 
                        weeklySummariesResult.rows.length + chirpsResult.rows.length;
    
    console.log(`✅ Cleared chirp-related data: ${reactionsResult.rows.length} reactions, ${notificationsResult.rows.length} notifications, ${weeklySummariesResult.rows.length} weekly summaries, ${chirpsResult.rows.length} chirps`);
    
    res.json({ 
      success: true, 
      message: `Successfully cleared all chirp-related data`,
      deletedCount: totalDeleted,
      details: {
        reactions: reactionsResult.rows.length,
        notifications: notificationsResult.rows.length,
        weeklySummaries: weeklySummariesResult.rows.length,
        chirps: chirpsResult.rows.length
      }
    });
  } catch (error) {
    console.error('❌ Error clearing chirp-related data:', error);
    res.status(500).json({ error: 'Failed to clear chirp-related data' });
  }
});

// Push token management (for mobile push notifications)
app.post('/api/push-tokens', async (req, res) => {
  try {
    console.log('Received push token request:', req.body);
    
    const userId = 'chirp-preview-001'; // Default to @chirp account for demo
    
    // Simple validation
    const { token, platform } = req.body;
    if (!token || !platform) {
      console.log('Missing required fields:', { token: !!token, platform: !!platform });
      return res.status(400).json({ error: 'Token and platform are required' });
    }

    if (isConnected && pool) {
      // Store in database
      try {
        await pool.query(
          `INSERT INTO push_tokens (user_id, token, platform, created_at, last_used) 
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [userId, token, platform]
        );
        console.log('✅ Push token stored in database:', { userId, token, platform });
      } catch (dbError) {
        console.error('❌ Database error storing push token:', dbError);
        // Fall back to mock mode
      }
    }

    // Always log the token registration
    console.log('Push token registered successfully:', { userId, token, platform });
    res.json({ success: true, message: 'Push token registered' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

async function startServer() {
  try {
    // Initialize database connection
    await initDatabase();
    
    console.log('Setting up static file serving...');
    
    // Check if dist directory exists
    const distPath = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('Dist directory not found, checking for public directory...');
      const publicPath = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicPath)) {
        console.error('Neither dist nor public directory found. Building application...');
        // Try to build the application
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
          console.log('Running build command...');
          await execPromise('npm run build');
          console.log('Build completed successfully');
        } catch (buildError) {
          console.error('Build failed:', buildError);
          console.log('Serving from Expo dev server instead...');
        }
      } else {
        // Use public directory if available
        app.use(express.static(publicPath));
        console.log('Serving static files from public directory');
      }
    } else {
      // Serve static files from dist directory (built Expo web app)
      app.use(express.static(distPath));
      console.log('Serving static files from dist directory');
    }
    
    // SPA fallback route - use middleware instead of wildcard route to avoid path-to-regexp issues
    app.use((req, res, next) => {
      // Skip API routes or if response already sent
      if (req.path.startsWith('/api') || res.headersSent) {
        return next();
      }
      
      // Try dist first, then public, then fallback
      const possiblePaths = [
        path.resolve(__dirname, 'dist/index.html'),
        path.resolve(__dirname, 'public/index.html'),
        path.resolve(__dirname, 'client/index.html')
      ];
      
      let indexPath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      }
      
      if (!indexPath) {
        console.error('No index.html found in any expected location');
        return res.status(404).send(`
          <html>
            <body>
              <h1>Application not found</h1>
              <p>Please build the client first using: <code>npm run build</code></p>
              <p>Checked paths:</p>
              <ul>
                ${possiblePaths.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </body>
          </html>
        `);
      }
      
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    });

    // Error handling middleware - must be at the end
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      if (err.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'Invalid JSON in request body' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    console.log(`Starting application server on http://localhost:${port}`);
    console.log('Checking for built assets and serving application...');
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✓ Application server is running on port ${port}`);
      console.log(`✓ Visit http://localhost:${port} to view the app`);
      console.log(`✓ Push tokens API available at http://localhost:${port}/api/push-tokens`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();