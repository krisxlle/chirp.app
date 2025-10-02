-- Cleanup duplicate users
-- This script finds and removes duplicate users causing the constraint violation

-- Step 1: Find all users with the email
SELECT 
    'All Users with Email' as step,
    'kriselle.t@gmail.com' as email,
    count(*) as total_count
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 2: Show all duplicate users
SELECT 
    'Duplicate Users in auth.users' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    encrypted_password IS NOT NULL as has_password,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com'
ORDER BY created_at;

-- Step 3: Show all users in public.users
SELECT 
    'Users in public.users' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com'
ORDER BY created_at;

-- Step 4: Find the most recent user (keep this one)
SELECT 
    'Most Recent User' as step,
    id,
    email,
    created_at,
    updated_at,
    'KEEP THIS ONE' as action
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com'
ORDER BY created_at DESC
LIMIT 1;

-- Step 5: Clean up duplicates - keep only the most recent user
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    keep_user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Get the ID of the most recent user (keep this one)
    SELECT id INTO keep_user_id 
    FROM auth.users 
    WHERE email = user_email
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE 'Keeping user with ID: %', keep_user_id;
    
    -- Delete all other users with the same email
    DELETE FROM auth.users 
    WHERE email = user_email 
    AND id != keep_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate users', deleted_count;
    
    -- Update the kept user to ensure it's properly configured
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('password123', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW(),
        raw_user_meta_data = '{"name": "Kriselle T"}',
        role = 'authenticated',
        aud = 'authenticated'
    WHERE id = keep_user_id;
    
    RAISE NOTICE 'Updated kept user with proper configuration';
    
    -- Clean up public.users - keep only the one matching the kept auth user
    DELETE FROM public.users 
    WHERE email = user_email 
    AND id != keep_user_id;
    
    -- Ensure public user exists with correct ID
    INSERT INTO public.users (
        id, email, first_name, last_name, handle, created_at, updated_at
    ) VALUES (
        keep_user_id,
        user_email,
        'Kriselle',
        'T',
        'kriselle',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        handle = EXCLUDED.handle,
        updated_at = NOW();
    
    RAISE NOTICE 'Ensured public user exists with correct ID';
END $$;

-- Step 6: Verify cleanup
SELECT 
    'Verification - auth.users' as step,
    count(*) as user_count,
    'Should be 1' as expected
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

SELECT 
    'Verification - public.users' as step,
    count(*) as user_count,
    'Should be 1' as expected
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 7: Show the final user
SELECT 
    'Final User - auth.users' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    encrypted_password IS NOT NULL as has_password,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

SELECT 
    'Final User - public.users' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 8: Test password verification
SELECT 
    'Password Test' as step,
    email,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 9: Final status
SELECT 
    'Final Status' as step,
    'Duplicate users cleaned up, try login now' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;

