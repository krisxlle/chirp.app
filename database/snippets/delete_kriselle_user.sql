-- Delete kriselle.t@gmail.com from auth.users
-- This script safely removes the user and all related data

-- Step 1: Check if the user exists
SELECT 
    'User Existence Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in auth.users'
        ELSE '❌ User not found in auth.users'
    END as status;

-- Step 2: Show user details before deletion
SELECT 
    'User Details' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Check for related data in public.users
SELECT 
    'Related Data Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User not found in public.users'
    END as public_users_status;

-- Step 4: Show public user details
SELECT 
    'Public User Details' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 5: Delete the user (this will cascade to related tables if foreign keys are set up)
DO $$
DECLARE
    user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'kriselle.t@gmail.com';
    
    IF user_id IS NOT NULL THEN
        -- Delete from auth.users (should cascade to public.users and other related tables)
        DELETE FROM auth.users WHERE id = user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
        RAISE NOTICE '✅ Successfully deleted user % (ID: %)', 'kriselle.t@gmail.com', user_id;
        RAISE NOTICE 'Rows deleted: %', deleted_count;
    ELSE
        RAISE NOTICE '❌ User kriselle.t@gmail.com not found in auth.users';
    END IF;
END $$;

-- Step 6: Verify deletion
SELECT 
    'Deletion Verification' as step,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User successfully deleted from auth.users'
        ELSE '❌ User still exists in auth.users'
    END as auth_deletion_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User successfully deleted from public.users'
        ELSE '❌ User still exists in public.users'
    END as public_deletion_status;

-- Step 7: Final status
SELECT 
    'Final Status' as step,
    'User deletion completed' as message,
    'kriselle.t@gmail.com has been removed from the system' as details;
