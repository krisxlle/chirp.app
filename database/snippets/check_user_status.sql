-- Check user status
-- This script checks the current status of the user in both tables

-- Step 1: Check user in auth.users (we know this exists)
SELECT 
    'Auth User Status' as step,
    id,
    email,
    encrypted_password,
    length(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 2: Check user in public.users
SELECT 
    'Public User Status' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User missing from public.users'
    END as status;

-- Step 3: Show public user details if exists
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

-- Step 4: Check if IDs match between tables
SELECT 
    'ID Match Check' as step,
    au.id as auth_id,
    pu.id as public_id,
    CASE 
        WHEN au.id = pu.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com' OR pu.email = 'kriselle.t@gmail.com';

-- Step 5: Test password verification
SELECT 
    'Password Verification Test' as step,
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 6: Check RLS policies on public.users
SELECT 
    'RLS Policy Check' as step,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- Step 7: Test the exact query that Supabase makes
SELECT 
    'Supabase Query Test' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 8: Create public user if missing
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    auth_user_id UUID;
    public_user_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Check if public user exists
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    RAISE NOTICE 'Auth user ID: %, Public user ID: %', auth_user_id, public_user_id;
    
    -- If public user doesn't exist, create it
    IF public_user_id IS NULL THEN
        INSERT INTO public.users (
            id, email, first_name, last_name, handle, created_at, updated_at
        ) VALUES (
            auth_user_id,
            user_email,
            'Kriselle',
            'T',
            'kriselle',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created public user with ID: %', auth_user_id;
    ELSE
        -- Update existing public user to match auth user ID
        UPDATE public.users 
        SET 
            id = auth_user_id,
            first_name = 'Kriselle',
            last_name = 'T',
            handle = 'kriselle',
            updated_at = NOW()
        WHERE email = user_email;
        RAISE NOTICE 'Updated public user with ID: %', auth_user_id;
    END IF;
END $$;

-- Step 9: Final verification
SELECT 
    'Final Verification' as step,
    au.id as auth_id,
    au.email,
    au.encrypted_password IS NOT NULL as has_password,
    au.email_confirmed_at,
    au.role,
    au.aud,
    pu.id as public_id,
    pu.first_name,
    pu.last_name,
    pu.handle,
    CASE 
        WHEN au.id = pu.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 10: Final password test
SELECT 
    'Final Password Test' as step,
    email,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 11: Final status
SELECT 
    'Final Status' as step,
    'User should now be able to log in with:' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;

