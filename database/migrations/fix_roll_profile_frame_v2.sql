-- Fix ambiguous column reference in roll_profile_frame function - Version 2
-- This completely rewrites the function to avoid any column ambiguity
-- Also updates profile frames to use actual assets

-- First, update the profile frames with correct asset paths
DELETE FROM profile_frames WHERE season_id = 1;

INSERT INTO profile_frames (name, description, rarity, season_id, image_url, drop_rate) VALUES 
-- Common frames (70% total)
('Simple Gray Frame', 'A simple and elegant gray frame for everyday use', 'common', 1, '/assets/Season 1/Simple Gray Frame Common.png', 0.4000),
('Purple Heart Frame', 'A charming purple heart frame with romantic vibes', 'common', 1, '/assets/Season 1/Purple Heart Frame Common.png', 0.3000),

-- Uncommon frames (20% total)
('Green Mushroom Frame', 'A whimsical green mushroom frame from the forest', 'uncommon', 1, '/assets/Season 1/Green Mushroom Frame Uncommon.png', 0.1000),
('Yellow Star Frame', 'A bright yellow star frame that shines with optimism', 'uncommon', 1, '/assets/Season 1/Yellow Star Frame Uncommon.png', 0.1000),

-- Rare frames (8% total)
('Pink Fairy Frame', 'A magical pink fairy frame with enchanting sparkles', 'rare', 1, '/assets/Season 1/Pink Fairy Frame Rare.png', 0.0400),
('Blue Butterfly Frame', 'A delicate blue butterfly frame with graceful wings', 'rare', 1, '/assets/Season 1/Blue Butterfly Frame Rare.png', 0.0400),

-- Epic frames (1.5% total)
('Red Cat Frame', 'A fierce red cat frame with mysterious feline energy', 'epic', 1, '/assets/Season 1/Red Cat Frame Epic.png', 0.0150),

-- Legendary frames (0.4% total)
('Green Leaf Frame', 'A legendary green leaf frame representing nature''s power', 'legendary', 1, '/assets/Season 1/Green Leaf Frame Legendary.png', 0.0020),
('Red Heart Frame', 'A legendary red heart frame symbolizing eternal love', 'legendary', 1, '/assets/Season 1/Red Heart Frame Legendary.png', 0.0020),

-- Mythic frames (0.1% total)
('Purple Bird Frame', 'A mythical purple bird frame with divine avian grace', 'mythic', 1, '/assets/Season 1/Purple Bird Frame Mythic.png', 0.0010);

-- Now fix the function
DROP FUNCTION IF EXISTS roll_profile_frame(UUID);

-- Ensure policies exist (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON seasons;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profile_frames;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_frame_collections;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_equipped_frames;

-- Recreate policies
CREATE POLICY "Allow all operations for authenticated users" ON seasons FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON profile_frames FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON user_frame_collections FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON user_equipped_frames FOR ALL USING (true);

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
  FROM user_frame_collections ufc
  WHERE ufc.user_id = user_uuid AND ufc.frame_id = selected_frame_id;
  
  -- Set is_new flag
  is_new_frame := (existing_collection_count = 0);
  
  -- Add or update collection
  IF existing_collection_count > 0 THEN
    -- Increment quantity
    UPDATE user_frame_collections 
    SET quantity = quantity + 1, obtained_at = NOW()
    WHERE user_id = user_uuid AND frame_id = selected_frame_id;
  ELSE
    -- Add new collection entry
    INSERT INTO user_frame_collections (user_id, frame_id, quantity)
    VALUES (user_uuid, selected_frame_id, 1);
  END IF;
  
  -- Return the result using variables instead of column references
  RETURN QUERY SELECT 
    selected_frame_id,
    selected_frame_name,
    selected_frame_rarity,
    selected_frame_image_url,
    is_new_frame;
END;
$$ LANGUAGE plpgsql;
