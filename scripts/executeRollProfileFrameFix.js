#!/usr/bin/env node

/**
 * Execute the fixed roll_profile_frame function SQL
 * This script will run the SQL fix in Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeSQLFix() {
  try {
    console.log('🔧 Executing roll_profile_frame function fix...');
    
    // The fixed SQL with explicit table aliases
    const fixedSQL = `
-- Drop the existing function
DROP FUNCTION IF EXISTS roll_profile_frame(UUID);

-- Create the fixed function with explicit table aliases
CREATE OR REPLACE FUNCTION roll_profile_frame(user_uuid UUID)
RETURNS TABLE (
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  is_new BOOLEAN
) AS $$
DECLARE
  random_roll DECIMAL(5,4);
  selected_frame_id INTEGER;
  selected_frame_name VARCHAR(100);
  selected_frame_rarity VARCHAR(20);
  selected_frame_image_url VARCHAR(500);
  existing_collection_count INTEGER;
  is_new_frame BOOLEAN;
BEGIN
  -- Generate random number between 0 and 1
  random_roll := random();
  
  -- Find frame based on drop rates (cumulative probability)
  SELECT pf.id, pf.name, pf.rarity, pf.image_url
  INTO selected_frame_id, selected_frame_name, selected_frame_rarity, selected_frame_image_url
  FROM profile_frames pf
  JOIN seasons s ON pf.season_id = s.id
  WHERE pf.is_available = true 
    AND s.is_active = true
    AND random_roll <= (
      SELECT SUM(pf2.drop_rate) 
      FROM profile_frames pf2
      JOIN seasons s2 ON pf2.season_id = s2.id
      WHERE pf2.is_available = true 
        AND s2.is_active = true
        AND pf2.id <= pf.id
    )
  ORDER BY pf.drop_rate ASC
  LIMIT 1;
  
  -- If no frame found, get the rarest available frame as fallback
  IF selected_frame_id IS NULL THEN
    SELECT pf.id, pf.name, pf.rarity, pf.image_url
    INTO selected_frame_id, selected_frame_name, selected_frame_rarity, selected_frame_image_url
    FROM profile_frames pf
    JOIN seasons s ON pf.season_id = s.id
    WHERE pf.is_available = true 
      AND s.is_active = true
    ORDER BY 
      CASE pf.rarity
        WHEN 'mythic' THEN 1
        WHEN 'legendary' THEN 2
        WHEN 'epic' THEN 3
        WHEN 'rare' THEN 4
        WHEN 'uncommon' THEN 5
        WHEN 'common' THEN 6
      END,
      pf.drop_rate ASC
    LIMIT 1;
  END IF;
  
  -- Check if user already has this frame (with explicit table alias)
  SELECT COUNT(*) INTO existing_collection_count
  FROM user_frame_collections ufc
  WHERE ufc.user_id = user_uuid AND ufc.frame_id = selected_frame_id;
  
  -- Set is_new flag
  is_new_frame := (existing_collection_count = 0);
  
  -- Add or update collection (with explicit table aliases)
  IF existing_collection_count > 0 THEN
    -- Update existing collection
    UPDATE user_frame_collections ufc
    SET quantity = ufc.quantity + 1, obtained_at = NOW()
    WHERE ufc.user_id = user_uuid AND ufc.frame_id = selected_frame_id;
  ELSE
    -- Add new collection entry
    INSERT INTO user_frame_collections (user_id, frame_id, quantity, obtained_at)
    VALUES (user_uuid, selected_frame_id, 1, NOW());
  END IF;
  
  -- Return the result with explicit column aliases to avoid ambiguity
  RETURN QUERY SELECT 
    selected_frame_id as frame_id,
    selected_frame_name as frame_name,
    selected_frame_rarity as frame_rarity,
    selected_frame_image_url as frame_image_url,
    is_new_frame as is_new;
END;
$$ LANGUAGE plpgsql;
    `;
    
    console.log('📝 Executing SQL fix...');
    
    // Try to execute the SQL using a direct approach
    // Since we can't execute arbitrary SQL through the client, we'll provide instructions
    console.log('⚠️  Cannot execute SQL directly through Supabase client.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('='.repeat(80));
    console.log(fixedSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('🧪 After running the SQL, test the function with:');
    console.log("SELECT * FROM roll_profile_frame('cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'::UUID);");
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
executeSQLFix()
  .then(() => {
    console.log('🎉 Instructions provided!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
