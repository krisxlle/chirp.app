-- Fix user ID mismatch between auth.users and public.users
-- The email exists but with a different ID

-- Step 1: Check the current state of both tables
SELECT 
    'Auth user' as source,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

SELECT 
    'Public user (current)' as source,
    id,
    email,
    first_name,
    last_name,
    created_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 2: Show the ID mismatch
SELECT 
    'ID Mismatch Check' as step,
    au.id as auth_id,
    pu.id as public_id,
    CASE 
        WHEN au.id = pu.id::uuid THEN '✅ IDs match'
        ELSE '❌ IDs mismatch - this is the problem!'
    END as status
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 3: Fix the mismatch by updating the public user ID to match auth user ID
UPDATE public.users 
SET id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'
WHERE email = 'kriselle.t@gmail.com'
AND id != 'cd73fb98-bad1-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 4: Verify the fix
SELECT 
    'After fix verification' as step,
    au.id as auth_id,
    pu.id as public_id,
    pu.email,
    pu.first_name,
    pu.last_name,
    CASE 
        WHEN au.id = pu.id::uuid THEN '✅ IDs now match'
        ELSE '❌ IDs still mismatch'
    END as status
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 5: Test the profile query
SELECT 
    'Profile query test' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 6: Final check
SELECT 
    'Final verification' as step,
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.users WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8') 
        THEN '✅ User profile exists and should load'
        ELSE '❌ User profile still missing'
    END as user_status;
