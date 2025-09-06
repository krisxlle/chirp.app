-- Diagnostic Script: Check Reactions Table Structure
-- Run this first to understand the data types

-- Check the reactions table structure
SELECT 
    'Table Structure' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Check existing policies
SELECT 
    'Existing Policies' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Check sample data to see actual types
SELECT 
    'Sample Data' as info,
    user_id,
    pg_typeof(user_id) as user_id_type,
    chirp_id,
    pg_typeof(chirp_id) as chirp_id_type
FROM public.reactions 
LIMIT 3;
