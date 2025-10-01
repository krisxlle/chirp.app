-- Fix Function Search Path Mutable warnings for all 8 functions
-- This script sets the search_path parameter to prevent security vulnerabilities

-- 1. Fix block_user function
DROP FUNCTION IF EXISTS block_user(UUID, UUID);
CREATE OR REPLACE FUNCTION block_user(
  p_blocker_id UUID,
  p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if already blocked
  IF EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id
  ) THEN
    RETURN FALSE; -- Already blocked
  END IF;
  
  -- Insert block relationship
  INSERT INTO user_blocks (blocker_id, blocked_id, created_at)
  VALUES (p_blocker_id, p_blocked_id, NOW());
  
  -- Remove any existing follow relationships (bidirectional)
  DELETE FROM follows 
  WHERE (follower_id = p_blocker_id AND following_id = p_blocked_id)
     OR (follower_id = p_blocked_id AND following_id = p_blocker_id);
  
  RETURN TRUE; -- Block added successfully
END;
$$;

-- 2. Fix unblock_user function
DROP FUNCTION IF EXISTS unblock_user(UUID, UUID);
CREATE OR REPLACE FUNCTION unblock_user(
  p_blocker_id UUID,
  p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove block relationship
  DELETE FROM user_blocks 
  WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;
  
  RETURN TRUE; -- Unblock successful
END;
$$;

-- 3. Fix update_updated_at_column function
-- Note: Cannot drop this function as it's used by triggers
-- We'll use ALTER FUNCTION to set the search_path instead
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- 4. Fix get_available_frames function
DROP FUNCTION IF EXISTS get_available_frames();
CREATE OR REPLACE FUNCTION get_available_frames()
RETURNS TABLE (
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_description TEXT,
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  frame_preview_url VARCHAR(500),
  drop_rate DECIMAL(5,4),
  season_name VARCHAR(100)
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pf.id as frame_id,
    pf.name as frame_name,
    pf.description as frame_description,
    pf.rarity as frame_rarity,
    pf.image_url as frame_image_url,
    pf.preview_url as frame_preview_url,
    pf.drop_rate,
    s.name as season_name
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
    pf.drop_rate ASC;
END;
$$;

-- 5. Fix get_user_frame_collection function
DROP FUNCTION IF EXISTS get_user_frame_collection(UUID);
CREATE OR REPLACE FUNCTION get_user_frame_collection(user_uuid UUID)
RETURNS TABLE (
  collection_id INTEGER,
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_description TEXT,
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  frame_preview_url VARCHAR(500),
  quantity INTEGER,
  obtained_at TIMESTAMP WITH TIME ZONE,
  season_name VARCHAR(100),
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ufc.id as collection_id,
    pf.id as frame_id,
    pf.name as frame_name,
    pf.description as frame_description,
    pf.rarity as frame_rarity,
    pf.image_url as frame_image_url,
    pf.preview_url as frame_preview_url,
    ufc.quantity,
    ufc.obtained_at,
    s.name as season_name,
    (uef.frame_id IS NOT NULL) as is_equipped
  FROM user_frame_collections ufc
  JOIN profile_frames pf ON ufc.frame_id = pf.id
  JOIN seasons s ON pf.season_id = s.id
  LEFT JOIN user_equipped_frames uef ON ufc.user_id = uef.user_id AND ufc.frame_id = uef.frame_id
  WHERE ufc.user_id = user_uuid
  ORDER BY 
    CASE pf.rarity
      WHEN 'mythic' THEN 1
      WHEN 'legendary' THEN 2
      WHEN 'epic' THEN 3
      WHEN 'rare' THEN 4
      WHEN 'uncommon' THEN 5
      WHEN 'common' THEN 6
    END,
    ufc.obtained_at DESC;
END;
$$;

-- 6. Fix get_user_equipped_frame function
DROP FUNCTION IF EXISTS get_user_equipped_frame(UUID);
CREATE OR REPLACE FUNCTION get_user_equipped_frame(user_uuid UUID)
RETURNS TABLE (
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  equipped_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pf.id as frame_id,
    pf.name as frame_name,
    pf.rarity as frame_rarity,
    pf.image_url as frame_image_url,
    uef.equipped_at
  FROM user_equipped_frames uef
  JOIN profile_frames pf ON uef.frame_id = pf.id
  WHERE uef.user_id = user_uuid
  LIMIT 1;
END;
$$;

-- 7. Fix roll_profile_frame function
DROP FUNCTION IF EXISTS roll_profile_frame(UUID);
CREATE OR REPLACE FUNCTION roll_profile_frame(user_uuid UUID)
RETURNS TABLE (
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  is_new BOOLEAN
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  random_roll DECIMAL(5,4);
  selected_frame RECORD;
  existing_collection INTEGER;
BEGIN
  -- Generate random number between 0 and 1
  random_roll := random();
  
  -- Find frame based on drop rates (cumulative probability)
  SELECT pf.id, pf.name, pf.rarity, pf.image_url
  INTO selected_frame
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
  IF selected_frame.id IS NULL THEN
    SELECT pf.id, pf.name, pf.rarity, pf.image_url
    INTO selected_frame
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
  SELECT COUNT(*) INTO existing_collection
  FROM user_frame_collections
  WHERE user_id = user_uuid AND frame_id = selected_frame.id;
  
  -- Add or update collection
  IF existing_collection > 0 THEN
    -- Increment quantity
    UPDATE user_frame_collections 
    SET quantity = quantity + 1, obtained_at = NOW()
    WHERE user_id = user_uuid AND frame_id = selected_frame.id;
  ELSE
    -- Add new collection entry
    INSERT INTO user_frame_collections (user_id, frame_id, quantity)
    VALUES (user_uuid, selected_frame.id, 1);
  END IF;
  
  -- Return the result
  RETURN QUERY SELECT 
    selected_frame.id as frame_id,
    selected_frame.name as frame_name,
    selected_frame.rarity as frame_rarity,
    selected_frame.image_url as frame_image_url,
    (existing_collection = 0) as is_new;
END;
$$;

-- 8. Fix equip_profile_frame function
DROP FUNCTION IF EXISTS equip_profile_frame(UUID, INTEGER);
CREATE OR REPLACE FUNCTION equip_profile_frame(user_uuid UUID, target_frame_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  user_owns_frame INTEGER;
BEGIN
  -- Check if user owns this frame
  SELECT COUNT(*) INTO user_owns_frame
  FROM user_frame_collections
  WHERE user_id = user_uuid AND frame_id = target_frame_id;
  
  IF user_owns_frame = 0 THEN
    RETURN FALSE; -- User doesn't own this frame
  END IF;
  
  -- Remove any currently equipped frame
  DELETE FROM user_equipped_frames WHERE user_id = user_uuid;
  
  -- Equip the new frame
  INSERT INTO user_equipped_frames (user_id, frame_id)
  VALUES (user_uuid, target_frame_id);
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION block_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user(UUID, UUID) TO authenticated;

-- Verify the functions have been updated with search_path
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'block_user', 'unblock_user', 'update_updated_at_column', 
        'get_available_frames', 'get_user_frame_collection', 
        'get_user_equipped_frame', 'roll_profile_frame', 'equip_profile_frame'
    )
ORDER BY p.proname;

-- Success message
SELECT 'Function search_path warnings fixed for all 8 functions!' as status;
