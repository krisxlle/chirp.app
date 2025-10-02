-- Check Auth Migration Status
-- This script helps diagnose authentication issues after migration

-- Step 1: Check overall migration status
SELECT 
    'Migration Status Overview' as title,
    (SELECT COUNT(*) FROM public.users) as custom_auth_users,
    (SELECT COUNT(*) FROM auth.users) as supabase_auth_users,
    (SELECT COUNT(*) FROM public.users u JOIN auth.users au ON u.email = au.email) as migrated_users,
    (SELECT COUNT(*) FROM public.users u LEFT JOIN auth.users au ON u.email = au.email WHERE au.email IS NULL) as unmigrated_users;

-- Step 2: Check for users with mismatched IDs
SELECT 
    'Users with ID mismatches' as issue,
    u.id as custom_auth_id,
    au.id as supabase_auth_id,
    u.email,
    u.first_name,
    u.last_name
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.id::UUID != au.id;

-- Step 3: Check for users not migrated
SELECT 
    'Unmigrated users' as issue,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.email IS NULL
ORDER BY u.created_at;

-- Step 4: Check for duplicate emails
SELECT 
    'Duplicate emails' as issue,
    email,
    COUNT(*) as count
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 5: Check for users with missing required fields
SELECT 
    'Users with missing fields' as issue,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    CASE 
        WHEN u.email IS NULL THEN 'Missing email'
        WHEN u.first_name IS NULL THEN 'Missing first_name'
        WHEN u.handle IS NULL THEN 'Missing handle'
        ELSE 'OK'
    END as missing_field
FROM public.users u
WHERE u.email IS NULL OR u.first_name IS NULL OR u.handle IS NULL;

-- Step 6: Check Supabase Auth user status
SELECT 
    'Supabase Auth user status' as info,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN 'Email confirmed'
        ELSE 'Email not confirmed'
    END as email_status
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 10;

-- Step 7: Check for users who can't log in
SELECT 
    'Potential login issues' as issue,
    u.email,
    u.first_name,
    u.last_name,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password,
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN 'Email not confirmed'
        WHEN au.encrypted_password IS NULL THEN 'No password set'
        ELSE 'Should be able to login'
    END as login_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE au.email_confirmed_at IS NULL OR au.encrypted_password IS NULL;

-- Step 8: Check RLS policies for users table
SELECT 
    'RLS Policies for users table' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- Step 9: Test authentication flow
SELECT 
    'Authentication test' as test,
    'Run this query to test if auth.uid() works' as instruction,
    'SELECT auth.uid() as current_user_id;' as test_query;

-- Step 10: Recommendations
SELECT 
    'Recommendations' as title,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.users u LEFT JOIN auth.users au ON u.email = au.email WHERE au.email IS NULL) > 0 
        THEN 'Run migration script to migrate remaining users'
        ELSE 'All users appear to be migrated'
    END as migration_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) > 0 
        THEN 'Some users need email confirmation'
        ELSE 'All users have confirmed emails'
    END as email_status,
    'Check Supabase Dashboard > Authentication > Users for detailed status' as next_step;

-- Success message
SELECT 'Auth migration status check completed!' as status;
