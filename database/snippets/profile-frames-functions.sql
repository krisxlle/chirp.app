-- Database functions for profile frames gacha system

-- Function to get available frames for current season
CREATE OR REPLACE FUNCTION get_available_frames()
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(100),
  description TEXT,
  rarity VARCHAR(20),
  season_id INTEGER,
  image_url VARCHAR(500),
  preview_url VARCHAR(500),
  drop_rate DECIMAL(5,4),
  season_name VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pf.id,
    pf.name,
    pf.description,
    pf.rarity,
    pf.season_id,
    pf.image_url,
    pf.preview_url,
    pf.drop_rate,
    s.name as season_name
  FROM profile_frames pf
  JOIN seasons s ON pf.season_id = s.id
  WHERE pf.is_available = true 
    AND s.is_active = true
  ORDER BY pf.drop_rate ASC, pf.rarity DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to roll for a profile frame
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
$$ LANGUAGE plpgsql;

-- Function to get user's frame collection
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Function to equip a profile frame
CREATE OR REPLACE FUNCTION equip_profile_frame(user_uuid UUID, frame_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_owns_frame INTEGER;
BEGIN
  -- Check if user owns this frame
  SELECT COUNT(*) INTO user_owns_frame
  FROM user_frame_collections
  WHERE user_id = user_uuid AND frame_id = frame_id;
  
  IF user_owns_frame = 0 THEN
    RETURN FALSE; -- User doesn't own this frame
  END IF;
  
  -- Remove any currently equipped frame
  DELETE FROM user_equipped_frames WHERE user_id = user_uuid;
  
  -- Equip the new frame
  INSERT INTO user_equipped_frames (user_id, frame_id)
  VALUES (user_uuid, frame_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's equipped frame
CREATE OR REPLACE FUNCTION get_user_equipped_frame(user_uuid UUID)
RETURNS TABLE (
  frame_id INTEGER,
  frame_name VARCHAR(100),
  frame_rarity VARCHAR(20),
  frame_image_url VARCHAR(500),
  equipped_at TIMESTAMP WITH TIME ZONE
) AS $$
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
$$ LANGUAGE plpgsql;
