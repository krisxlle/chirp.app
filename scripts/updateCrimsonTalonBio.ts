#!/usr/bin/env ts-node

/**
 * Update CrimsonTalon Bio
 * 
 * This script updates CrimsonTalon's bio in the database.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCrimsonTalonBio() {
  try {
    console.log('🤖 Updating CrimsonTalon bio...');
    
    // Find the CrimsonTalon user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, custom_handle, bio')
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
    console.log('📝 Current bio:', user.bio);

    // Update the bio
    const newBio = 'Mythical bird bringing you the latest trending stories twice daily. Stay informed with CrimsonTalon.';
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        bio: newBio,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating bio:', updateError);
      return;
    }

    console.log('✅ CrimsonTalon bio updated successfully!');
    console.log('📝 New bio:', newBio);

  } catch (error) {
    console.error('❌ Error updating bio:', error);
  }
}

// Run the update
if (require.main === module) {
  updateCrimsonTalonBio();
}

export { updateCrimsonTalonBio };
