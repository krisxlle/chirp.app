-- Fix RLS policies for reactions table
-- This script enables proper access to the reactions table for authenticated users

-- First, let's check the current state of RLS on reactions table
SELECT 
    'Current RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Check existing policies on reactions table
SELECT 
    'Existing Policies' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Enable RLS on reactions table (if not already enabled)
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to start fresh)
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update own reactions" ON public.reactions;

-- Create new RLS policies for reactions table

-- Policy 1: Users can view all reactions (for displaying reaction counts)
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

-- Policy 2: Users can insert their own reactions
CREATE POLICY "Users can insert own reactions" ON public.reactions
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id
    );

-- Policy 3: Users can delete their own reactions
CREATE POLICY "Users can delete own reactions" ON public.reactions
    FOR DELETE USING (
        auth.uid()::text = user_id
    );

-- Policy 4: Users can update their own reactions (if needed)
CREATE POLICY "Users can update own reactions" ON public.reactions
    FOR UPDATE USING (
        auth.uid()::text = user_id
    ) WITH CHECK (
        auth.uid()::text = user_id
    );

-- Verify the policies were created
SELECT 
    'New Policies Created' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Test the setup by checking if we can query the reactions table
SELECT 
    'Test Query' as status,
    COUNT(*) as reaction_count
FROM public.reactions;

-- Success message
SELECT 'RLS policies for reactions table have been configured successfully!' as result;
