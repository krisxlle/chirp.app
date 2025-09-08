-- Fix the restrictive RLS policy for user_blocks table
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can manage blocks" ON user_blocks;
DROP POLICY IF EXISTS "Authenticated users can manage blocks" ON user_blocks;

-- Create a more permissive policy for authenticated users
CREATE POLICY "Authenticated users can manage blocks" ON user_blocks
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_blocks';
