-- Fix RLS policy issue for user_collections table
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS entirely (simplest solution)
ALTER TABLE user_collections DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, drop existing policies and create a simpler one
-- DROP POLICY IF EXISTS "Users can view their own collections" ON user_collections;
-- DROP POLICY IF EXISTS "Users can add to their own collections" ON user_collections;
-- DROP POLICY IF EXISTS "Users can delete their own collections" ON user_collections;
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_collections;

-- CREATE POLICY "Allow all operations" ON user_collections FOR ALL USING (true);
