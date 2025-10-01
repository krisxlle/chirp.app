-- Fix RLS security issue for user_collections table
-- This script enables RLS and ensures proper policies are in place

-- First, check if RLS is enabled and enable it if not
DO $$
BEGIN
    -- Check if RLS is enabled on user_collections table
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'user_collections'
        AND c.relrowsecurity = true
    ) THEN
        -- Enable RLS on user_collections table
        ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on user_collections table';
    ELSE
        RAISE NOTICE 'RLS already enabled on user_collections table';
    END IF;
END $$;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Users can add to their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON public.user_collections;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.user_collections;
DROP POLICY IF EXISTS "Allow all operations" ON public.user_collections;

-- Create proper RLS policies for user_collections
-- Policy 1: Users can view their own collections
CREATE POLICY "Users can view their own collections" ON public.user_collections
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can add to their own collections
CREATE POLICY "Users can add to their own collections" ON public.user_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete their own collections
CREATE POLICY "Users can delete their own collections" ON public.user_collections
    FOR DELETE USING (auth.uid() = user_id);

-- Policy 4: Users can update their own collections (if needed)
CREATE POLICY "Users can update their own collections" ON public.user_collections
    FOR UPDATE USING (auth.uid() = user_id);

-- Verify the setup
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_collections') as policy_count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_collections';

-- Show the policies that were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_collections'
ORDER BY policyname;

-- Success message
SELECT 'RLS security issue fixed for user_collections table!' as status;
