-- Fix RLS policies for user_blocks table
-- This script should be run in Supabase SQL editor

-- First, let's check the current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_blocks';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can manage blocks" ON user_blocks;

-- Create a more permissive policy that allows authenticated users to manage blocks
CREATE POLICY "Authenticated users can manage blocks" ON user_blocks
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Alternative: Create separate policies for different operations
-- CREATE POLICY "Users can insert blocks" ON user_blocks
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (true);

-- CREATE POLICY "Users can delete blocks" ON user_blocks
-- FOR DELETE 
-- TO authenticated
-- USING (true);

-- CREATE POLICY "Users can view blocks" ON user_blocks
-- FOR SELECT 
-- TO authenticated
-- USING (true);

-- Test the policy by trying to insert a test record
-- INSERT INTO user_blocks (blocker_id, blocked_id, created_at) 
-- VALUES ('test-blocker', 'test-blocked', NOW())
-- ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

-- Clean up test record
-- DELETE FROM user_blocks WHERE blocker_id = 'test-blocker' AND blocked_id = 'test-blocked';
