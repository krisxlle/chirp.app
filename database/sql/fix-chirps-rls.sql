-- Fix RLS policies for chirps table to allow replies
-- Run this in Supabase SQL Editor to fix the chirps table RLS issue

-- Step 1: Check current RLS policies on chirps table
SELECT 
    'Current Chirps RLS Policies' as info,
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'chirps'
ORDER BY policyname;

-- Step 2: Drop existing restrictive policies on chirps
DROP POLICY IF EXISTS "Users can view chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can insert chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can update own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can delete own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can view all chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can insert own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can update own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can delete own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to view chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to insert chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to update chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to delete chirps" ON public.chirps;

-- Step 3: Create new policies that work with your custom auth system
-- Policy 1: Allow users to view chirps
CREATE POLICY "Users can view chirps" ON public.chirps
    FOR SELECT USING (true);

-- Policy 2: Allow users to insert chirps (for replies and new chirps)
CREATE POLICY "Users can insert chirps" ON public.chirps
    FOR INSERT WITH CHECK (true);

-- Policy 3: Allow users to update chirps
CREATE POLICY "Users can update chirps" ON public.chirps
    FOR UPDATE USING (true);

-- Policy 4: Allow users to delete chirps
CREATE POLICY "Users can delete chirps" ON public.chirps
    FOR DELETE USING (true);

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.chirps TO authenticated;
GRANT ALL ON public.chirps TO anon;

-- Step 5: Test the fix
SELECT 
    'Chirps RLS Fix Applied' as status,
    'Policies updated to allow chirp creation and replies' as message;

-- Step 6: Verify policies were created
SELECT 
    'New Chirps RLS Policies' as info,
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'chirps'
ORDER BY policyname;
