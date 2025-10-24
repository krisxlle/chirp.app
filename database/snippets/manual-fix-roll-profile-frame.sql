-- Manual SQL to fix roll_profile_frame function
-- Run this directly in Supabase SQL Editor

-- Step 1: Check current function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'roll_profile_frame';

-- Step 2: Drop and recreate the function
DROP FUNCTION IF EXISTS roll_profile_frame(UUID);

-- Step 3: Create the fixed function
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
  
  -- Check if user already has this frame
  SELECT COUNT(*) INTO existing_collection_count
  FROM user_frame_collections
  WHERE user_id = user_uuid AND frame_id = selected_frame_id;
  
  -- Set is_new flag
  is_new_frame := (existing_collection_count = 0);
  
  -- Add or update collection
  IF existing_collection_count > 0 THEN
    -- Update existing collection
    UPDATE user_frame_collections 
    SET quantity = quantity + 1, obtained_at = NOW()
    WHERE user_id = user_uuid AND frame_id = selected_frame_id;
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

-- Step 4: Test the function
SELECT * FROM roll_profile_frame('cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'::UUID);

-- Step 5: Verify function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'roll_profile_frame';
