-- Fix ambiguous column reference in equip_profile_frame function
-- The function parameter 'frame_id' conflicts with the table column 'frame_id'
-- We'll rename the parameter to avoid the conflict

DROP FUNCTION IF EXISTS equip_profile_frame(UUID, INTEGER);

CREATE OR REPLACE FUNCTION equip_profile_frame(user_uuid UUID, target_frame_id INTEGER)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;
