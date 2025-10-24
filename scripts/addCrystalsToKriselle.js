#!/usr/bin/env node

/**
 * Add 50,000 crystals to @kriselle account for testing purposes
 * This script connects to Supabase and updates the crystal balance
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addCrystalsToKriselle() {
  try {
    console.log('🔍 Looking for @kriselle account...');
    
    // First, let's find the user by email or handle
    const { data: users, error: searchError } = await supabase
      .from('users')
      .select('id, email, handle, custom_handle, crystal_balance')
      .or('email.eq.kriselle.t@gmail.com,custom_handle.eq.kriselle,handle.eq.kriselle');
    
    if (searchError) {
      console.error('❌ Error searching for user:', searchError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No user found with email kriselle.t@gmail.com or handle @kriselle');
      console.log('Available users:');
      
      // Show all users for debugging
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, email, handle, custom_handle, crystal_balance')
        .limit(10);
      
      if (allUsers) {
        allUsers.forEach(user => {
          console.log(`  - ${user.email} (@${user.custom_handle || user.handle}) - ${user.crystal_balance || 0} crystals`);
        });
      }
      return;
    }
    
    const user = users[0];
    console.log(`✅ Found user: ${user.email} (@${user.custom_handle || user.handle})`);
    console.log(`   Current crystal balance: ${user.crystal_balance || 0}`);
    
    // Add 50,000 crystals
    const newBalance = (user.crystal_balance || 0) + 50000;
    
    console.log(`💰 Adding 50,000 crystals...`);
    console.log(`   New balance will be: ${newBalance}`);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        crystal_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ Error updating crystal balance:', updateError);
      return;
    }
    
    console.log('✅ Successfully added 50,000 crystals to @kriselle account!');
    console.log(`   Final balance: ${newBalance} crystals`);
    
    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('id, email, handle, custom_handle, crystal_balance')
      .eq('id', user.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }
    
    console.log('🔍 Verification:');
    console.log(`   User: ${updatedUser.email} (@${updatedUser.custom_handle || updatedUser.handle})`);
    console.log(`   Crystal balance: ${updatedUser.crystal_balance}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addCrystalsToKriselle()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
