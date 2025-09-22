// Vercel serverless function for authentication
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'chirp-vercel',
    },
  },
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
    return;
  }

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
      console.log('✅ Found user by custom_handle:', customHandleUser.custom_handle);
    } else {
      // Try handle if custom_handle didn't work
      const { data: handleUser, error: handleError } = await supabase
        .from('users')
        .select('*')
        .ilike('handle', username)
        .single();

      if (handleUser) {
        userProfile = handleUser;
        console.log('✅ Found user by handle:', handleUser.handle);
      } else {
        // Try email as last resort
        const { data: emailUser, error: emailError } = await supabase
          .from('users')
          .select('*')
          .ilike('email', username)
          .single();

        if (emailUser) {
          userProfile = emailUser;
          console.log('✅ Found user by email:', emailUser.email);
        }
      }
    }

    if (!userProfile) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // For now, we'll do a simple password check
    // In a real implementation, you'd hash the password and compare with stored hash
    // For this demo, we'll check if password matches a simple pattern
    const isValidPassword = password === 'password' || password === userProfile.email?.split('@')[0];
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    console.log('✅ Authentication successful for user:', userProfile.custom_handle || userProfile.handle || userProfile.email);
    
    // Return user data (without sensitive information)
    const userData = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      custom_handle: userProfile.custom_handle,
      handle: userProfile.handle,
      profile_image_url: userProfile.profile_image_url,
      banner_image_url: userProfile.banner_image_url,
      bio: userProfile.bio,
      link_in_bio: userProfile.link_in_bio,
      created_at: userProfile.created_at,
      crystal_balance: userProfile.crystal_balance || 0,
      is_chirp_plus: userProfile.is_chirp_plus || false,
      show_chirp_plus_badge: userProfile.show_chirp_plus_badge || false
    };

    res.status(200).json(userData);
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
