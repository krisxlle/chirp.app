-- Create RPC function for blocking users (bypasses RLS)
CREATE OR REPLACE FUNCTION block_user(
  p_blocker_id UUID,
  p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create RPC function for unblocking users
CREATE OR REPLACE FUNCTION unblock_user(
  p_blocker_id UUID,
  p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove block relationship
  DELETE FROM user_blocks 
  WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;
  
  RETURN TRUE; -- Unblock successful
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION block_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user(UUID, UUID) TO authenticated;
