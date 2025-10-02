// Vercel serverless function for user registration
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
      'X-Client-Info': 'chirp-vercel-signup',
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
    const { name, email, customHandle, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and password are required' 
      });
    }
    
    console.log('🔐 Registration attempt for email:', email);
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, handle, custom_handle')
      .or(`email.eq.${email},handle.eq.${customHandle || ''},custom_handle.eq.${customHandle || ''}`)
      .single();

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email or handle already exists' 
      });
    }

    // Generate a unique handle if customHandle is not provided
    let finalHandle = customHandle;
    if (!finalHandle) {
      // Create handle from name (first name + last name initial)
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0].toLowerCase();
      const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toLowerCase() : '';
      finalHandle = `${firstName}${lastNameInitial}`;
      
      // Check if handle is available, if not add numbers
      let handleCounter = 1;
      let originalHandle = finalHandle;
      while (true) {
        const { data: handleCheck } = await supabase
          .from('users')
          .select('id')
          .eq('handle', finalHandle)
          .single();
        
        if (!handleCheck) break;
        finalHandle = `${originalHandle}${handleCounter}`;
        handleCounter++;
      }
    }

    // Use Supabase Auth to create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          custom_handle: customHandle,
          handle: finalHandle
        }
      }
    });

    if (authError) {
      console.error('❌ Supabase Auth error:', authError);
      return res.status(400).json({ 
        success: false, 
        error: authError.message 
      });
    }

    if (!authData.user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to create user account' 
      });
    }

    console.log('✅ User created in Supabase Auth:', authData.user.id);

    // Create user profile in public.users table
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the same ID from Supabase Auth
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        display_name: name,
        email: email,
        handle: finalHandle,
        custom_handle: customHandle || finalHandle,
        bio: 'New to Chirp! 🐦',
        crystal_balance: 100, // Give new users some starting crystals
        is_chirp_plus: false,
        show_chirp_plus_badge: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating user profile:', createError);
      return res.status(500).json({ 
        success: false, 
        error: 'Account created but profile setup failed. Please contact support.' 
      });
    }

    console.log('✅ User profile created successfully:', newUser.email);
    
    // Return user data (without sensitive information)
    const userData = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      display_name: newUser.display_name,
      custom_handle: newUser.custom_handle,
      handle: newUser.handle,
      profile_image_url: newUser.profile_image_url,
      banner_image_url: newUser.banner_image_url,
      bio: newUser.bio,
      link_in_bio: newUser.link_in_bio,
      created_at: newUser.created_at,
      crystal_balance: newUser.crystal_balance || 100,
      is_chirp_plus: newUser.is_chirp_plus || false,
      show_chirp_plus_badge: newUser.show_chirp_plus_badge || false,
      email_confirmed: !!authData.user.email_confirmed_at,
      requires_email_confirmation: !authData.user.email_confirmed_at
    };

    res.status(201).json(userData);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
