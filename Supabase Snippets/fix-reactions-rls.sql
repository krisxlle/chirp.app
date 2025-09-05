-- Fix RLS for reactions table
-- This script enables RLS on the reactions table and creates appropriate policies

-- First, let's check the current state of the reactions table
SELECT 
    'Current Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Check if there are any existing policies on reactions table
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

-- Check the structure of the reactions table to understand the columns
SELECT 
    'Table Structure' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;

-- Enable RLS on reactions table
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create appropriate RLS policies for reactions table
-- Users can view all reactions (for displaying reaction counts)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can view all reactions') THEN
        CREATE POLICY "Users can view all reactions" ON public.reactions
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all reactions';
    END IF;
END $$;

-- Users can insert their own reactions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can insert own reactions') THEN
        CREATE POLICY "Users can insert own reactions" ON public.reactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can insert own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert own reactions';
    END IF;
END $$;

-- Users can update their own reactions (for changing reaction type)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can update own reactions') THEN
        CREATE POLICY "Users can update own reactions" ON public.reactions
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can update own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own reactions';
    END IF;
END $$;

-- Users can delete their own reactions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can delete own reactions') THEN
        CREATE POLICY "Users can delete own reactions" ON public.reactions
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can delete own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete own reactions';
    END IF;
END $$;

-- Grant necessary permissions for reactions table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.reactions TO authenticated;

-- Grant read-only permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.reactions TO anon;

-- Create indexes for better performance on reactions
-- Only create indexes for columns that actually exist
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_chirp_id ON public.reactions(chirp_id);

-- Try to create type index only if the column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(type);
        RAISE NOTICE 'Created index: idx_reactions_type';
    ELSE
        RAISE NOTICE 'Column "type" does not exist in reactions table, skipping type index';
    END IF;
END $$;

-- Try to create created_at index only if the column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON public.reactions(created_at);
        RAISE NOTICE 'Created index: idx_reactions_created_at';
    ELSE
        RAISE NOTICE 'Column "created_at" does not exist in reactions table, skipping created_at index';
    END IF;
END $$;

-- Final verification - show RLS status and policies
SELECT 
    'Final RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

SELECT 
    'Final Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Success message
SELECT 'Reactions RLS Setup Complete!' as status, 'RLS enabled with proper policies' as message;
