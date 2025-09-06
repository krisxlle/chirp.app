-- Comprehensive Diagnostic Script for Reactions RLS Issues
-- Run this step by step to identify the exact problem

-- Step 1: Check if reactions table exists and its structure
SELECT 
    'Step 1: Table Exists' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions' AND table_schema = 'public') 
        THEN 'YES' 
        ELSE 'NO' 
    END as table_exists;

-- Step 2: Get detailed table structure
SELECT 
    'Step 2: Table Structure' as step,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check RLS status
SELECT 
    'Step 3: RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Step 4: Check existing policies
SELECT 
    'Step 4: Existing Policies' as step,
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

-- Step 5: Check if there's any data in the table
SELECT 
    'Step 5: Data Count' as step,
    COUNT(*) as total_reactions
FROM public.reactions;

-- Step 6: Check sample data types (if data exists)
SELECT 
    'Step 6: Sample Data Types' as step,
    user_id,
    pg_typeof(user_id) as user_id_type,
    chirp_id,
    pg_typeof(chirp_id) as chirp_id_type,
    created_at
FROM public.reactions 
LIMIT 3;

-- Step 7: Check current user context
SELECT 
    'Step 7: Auth Context' as step,
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type,
    auth.role() as current_role;

-- Step 8: Test a simple query to see if we can access the table at all
SELECT 
    'Step 8: Access Test' as step,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'CAN ACCESS TABLE'
        ELSE 'CANNOT ACCESS TABLE'
    END as access_status
FROM public.reactions;

-- Step 9: Check if the issue is with the specific column comparison
SELECT 
    'Step 9: Type Comparison Test' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.reactions LIMIT 1) THEN
            CASE 
                WHEN EXISTS (SELECT 1 FROM public.reactions WHERE auth.uid()::text = user_id LIMIT 1) THEN 'TEXT COMPARISON WORKS'
                WHEN EXISTS (SELECT 1 FROM public.reactions WHERE auth.uid() = user_id::uuid LIMIT 1) THEN 'UUID COMPARISON WORKS'
                ELSE 'NEITHER COMPARISON WORKS'
            END
        ELSE 'NO DATA TO TEST'
    END as comparison_test;
