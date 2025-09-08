#!/usr/bin/env ts-node

/**
 * Update CrimsonTalon Profile Photo Script
 * 
 * This script updates the existing CrimsonTalon bot user's profile photo.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCrimsonTalonProfilePhoto() {
  try {
    console.log('🤖 Updating CrimsonTalon profile photo...');
    
    // Find the CrimsonTalon user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, custom_handle, profile_image_url')
      .eq('custom_handle', 'CrimsonTalon')
      .single();

    if (findError) {
      console.error('❌ Error finding CrimsonTalon user:', findError);
      return;
    }

    if (!user) {
      console.log('❌ CrimsonTalon user not found');
      return;
    }

    console.log('✅ Found CrimsonTalon user:', user.id);
    console.log('📸 Current profile photo:', user.profile_image_url);

    // Update the profile photo
    const newProfileUrl = 'https://via.placeholder.com/150/ff0000/ffffff?text=🐦';
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_image_url: newProfileUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating profile photo:', updateError);
      return;
    }

    console.log('✅ CrimsonTalon profile photo updated successfully!');
    console.log('📸 New profile photo URL:', newProfileUrl);

  } catch (error) {
    console.error('❌ Error updating profile photo:', error);
  }
}

// Run the update
if (require.main === module) {
  updateCrimsonTalonProfilePhoto();
}

export { updateCrimsonTalonProfilePhoto };
