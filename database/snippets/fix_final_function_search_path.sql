-- Fix final Function Search Path Mutable warnings
-- This script specifically targets the remaining block_user and unblock_user functions

-- Check current function configurations
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('block_user', 'unblock_user')
ORDER BY p.proname;

-- 1. Fix block_user function with explicit search_path
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

-- 2. Fix unblock_user function with explicit search_path
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
    AND p.proname IN ('block_user', 'unblock_user')
ORDER BY p.proname;

-- Alternative approach: Use ALTER FUNCTION to set search_path
-- This might be more reliable than recreating the functions
ALTER FUNCTION block_user(UUID, UUID) SET search_path = public;
ALTER FUNCTION unblock_user(UUID, UUID) SET search_path = public;

-- Final verification
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('block_user', 'unblock_user')
ORDER BY p.proname;

-- Success message
SELECT 'Final function search_path warnings fixed!' as status;
