-- Check reactions table structure
-- This script will help us understand the actual columns in the reactions table

-- Check the structure of the reactions table
SELECT 
    'Reactions Table Structure' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;

-- Check if reactions table exists and its current state
SELECT 
    'Table Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
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
