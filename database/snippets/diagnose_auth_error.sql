-- Diagnose authentication error after migration
-- This script checks for potential issues that could cause "Database error querying schema"

-- Step 1: Check if user exists in both tables
SELECT 
    'User Existence Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User missing from public.users'
    END as public_users_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in auth.users'
        ELSE '❌ User missing from auth.users'
    END as auth_users_status;

-- Step 2: Check user details
SELECT 
    'User Details' as step,
    u.id as public_users_id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.created_at as public_created_at,
    au.id as auth_users_id,
    au.email_confirmed_at,
    au.created_at as auth_created_at,
    au.encrypted_password IS NOT NULL as has_password
FROM public.users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com' OR au.email = 'kriselle.t@gmail.com';

-- Step 3: Check for ID mismatches
SELECT 
    'ID Mismatch Check' as step,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status,
    u.id as public_id,
    au.id as auth_id
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 4: Check RLS policies on users table
SELECT 
    'RLS Policy Check' as step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- Step 5: Check if RLS is enabled on users table
SELECT 
    'RLS Status Check' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 6: Check for any foreign key constraint issues
SELECT 
    'Foreign Key Check' as step,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'users' OR ccu.table_name = 'users')
ORDER BY tc.table_name, tc.constraint_name;

-- Step 7: Check for any triggers on users table
SELECT 
    'Trigger Check' as step,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
    AND event_object_table = 'users'
ORDER BY trigger_name;

-- Step 8: Test basic user query (what Supabase might be doing)
SELECT 
    'Basic Query Test' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 9: Check for any recent errors in the database
SELECT 
    'Recent Errors Check' as step,
    'Check Supabase dashboard logs for any recent database errors' as instruction;

