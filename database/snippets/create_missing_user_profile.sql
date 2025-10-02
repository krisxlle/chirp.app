-- Create missing user profile
-- The user exists in auth.users but not in public.users

-- Step 1: Check if user exists in auth.users
SELECT 
    'Auth user check' as step,
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 2: Check if user exists in public.users (should be empty)
SELECT 
    'Public user check (before)' as step,
    COUNT(*) as user_count
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 3: Create the missing user record in public.users
-- Extract data from auth.users and create corresponding public.users record
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at,
    updated_at
) VALUES (
    'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8',
    'kriselle.t@gmail.com',
    'Kriselle',  -- From the auth user data shown in console logs
    'T',         -- From the auth user data shown in console logs  
    'kriselle',  -- From the auth user data shown in console logs
    'kriselle',  -- From the auth user data shown in console logs
    NOW(),
    NOW()
);

-- Step 4: Verify the user was created
SELECT 
    'Public user check (after)' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 5: Test the query that was failing
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

-- Step 6: Final verification
SELECT 
    'Final verification' as step,
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.users WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8') 
        THEN '✅ User exists and profile should load'
        ELSE '❌ User still does not exist'
    END as user_status;
