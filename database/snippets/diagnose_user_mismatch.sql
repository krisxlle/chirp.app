-- Diagnose user ID mismatch
-- Run this first to see the current state

-- Step 1: Check auth user
SELECT 
    'Auth user' as source,
    id,
    email,
    created_at,
    'Authorized user from Supabase Auth' as note
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 2: Check public user(s) - there might be multiple
SELECT 
    'Public user(s)' as source,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at,
    'Profile data in public.users table' as note
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Check if the auth ID exists anywhere in public.users
SELECT 
    'ID search in public.users' as check,
    id,
    email,
    first_name,
    CASE 
        WHEN id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8' THEN '✅ Found auth ID'
        ELSE '❌ Different ID'
    END as match
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 4: Show summary
SELECT 
    'Summary' as step,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'kriselle.t@gmail.com') as auth_count,
    (SELECT COUNT(*) FROM public.users WHERE email = 'kriselle.t@gmail.com') as public_count,
    (SELECT COUNT(*) FROM public.users WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8') as auth_id_exists;
