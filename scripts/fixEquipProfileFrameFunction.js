#!/usr/bin/env node

/**
 * Fix equip_profile_frame function parameter mismatch
 * The function expects target_frame_id but code calls it with frame_id
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixEquipProfileFrameFunction() {
  try {
    console.log('🔧 Fixing equip_profile_frame function parameter mismatch...');
    
    // The fixed SQL with correct parameter names
    const fixedSQL = `
-- Drop the existing function
DROP FUNCTION IF EXISTS equip_profile_frame(UUID, INTEGER);

-- Create the fixed function with correct parameter names
CREATE OR REPLACE FUNCTION equip_profile_frame(user_uuid UUID, frame_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_owns_frame INTEGER;
BEGIN
  -- Check if user owns this frame
  SELECT COUNT(*) INTO user_owns_frame
  FROM user_frame_collections ufc
  WHERE ufc.user_id = user_uuid AND ufc.frame_id = frame_id;
  
  IF user_owns_frame = 0 THEN
    RETURN FALSE; -- User doesn't own this frame
  END IF;
  
  -- Remove any currently equipped frame
  DELETE FROM user_equipped_frames WHERE user_id = user_uuid;
  
  -- Equip the new frame
  INSERT INTO user_equipped_frames (user_id, frame_id, equipped_at)
  VALUES (user_uuid, frame_id, NOW());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
    `;
    
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('='.repeat(80));
    console.log(fixedSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('🧪 After running the SQL, test the function with:');
    console.log("SELECT equip_profile_frame('cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'::UUID, 1);");
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
fixEquipProfileFrameFunction()
  .then(() => {
    console.log('🎉 Instructions provided!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
