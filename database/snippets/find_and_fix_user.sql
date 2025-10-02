-- Find and fix user
-- This script helps locate the user and fix any issues

-- Step 1: Check if user exists in auth.users
SELECT 
    'User in auth.users' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists'
        ELSE '❌ User does not exist'
    END as status;

-- Step 2: Show all users in auth.users (if any)
SELECT 
    'All users in auth.users' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com'
ORDER BY created_at;

-- Step 3: Check if user exists in public.users
SELECT 
    'User in public.users' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists'
        ELSE '❌ User does not exist'
    END as status;

-- Step 4: Show all users in public.users (if any)
SELECT 
    'All users in public.users' as step,
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

-- Step 5: Check for any users with similar emails
SELECT 
    'Similar emails in auth.users' as step,
    id,
    email,
    created_at
FROM auth.users 
WHERE email LIKE '%kriselle%' OR email LIKE '%gmail%'
ORDER BY created_at;

-- Step 6: Check for any users with similar emails in public.users
SELECT 
    'Similar emails in public.users' as step,
    id,
    email,
    first_name,
    last_name,
    created_at
FROM public.users 
WHERE email LIKE '%kriselle%' OR email LIKE '%gmail%'
ORDER BY created_at;

-- Step 7: Create the user if it doesn't exist
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    auth_user_id UUID;
    public_user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Check if user exists in public.users
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    RAISE NOTICE 'Auth user ID: %, Public user ID: %', auth_user_id, public_user_id;
    
    -- If auth user doesn't exist, create it
    IF auth_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, 
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud, instance_id
        ) VALUES (
            gen_random_uuid(),
            user_email,
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{}',
            '{"name": "Kriselle T"}',
            false,
            'authenticated',
            'authenticated',
            gen_random_uuid()
        );
        
        -- Get the new auth user ID
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        RAISE NOTICE 'Created auth user with ID: %', auth_user_id;
    ELSE
        -- Update existing auth user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('password123', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW(),
            raw_user_meta_data = '{"name": "Kriselle T"}',
            role = 'authenticated',
            aud = 'authenticated'
        WHERE email = user_email;
        
        RAISE NOTICE 'Updated auth user with ID: %', auth_user_id;
    END IF;
    
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
        -- Update existing public user
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

-- Step 8: Verify the user was created/updated
SELECT 
    'Verification - auth.users' as step,
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
    'Verification - public.users' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 9: Test password verification
SELECT 
    'Password Test' as step,
    email,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 10: Final status
SELECT 
    'Final Status' as step,
    'User created/updated, try login now' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;
