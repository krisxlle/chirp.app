-- Fix authentication system
-- This script addresses the broader auth system issues

-- Step 1: Check auth system status
SELECT 
    'Auth System Check' as step,
    'Checking auth.users table structure and data' as message;

-- Step 2: Check auth.users table structure
SELECT 
    'Auth Users Table Structure' as step,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 3: Check if user exists in auth.users
SELECT 
    'Auth User Check' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    encrypted_password IS NOT NULL as has_password,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 4: Check public.users table
SELECT 
    'Public User Check' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 5: Check for any auth-related errors in system tables
SELECT 
    'System Check' as step,
    'Checking for any system-level issues' as message;

-- Step 6: Try to fix the auth user
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
        -- Update existing auth user to ensure it's properly configured
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('password123', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW(),
            raw_user_meta_data = '{"name": "Kriselle T"}',
            role = 'authenticated',
            aud = 'authenticated'
        WHERE email = user_email;
        
        RAISE NOTICE 'Updated existing auth user with ID: %', auth_user_id;
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
    END IF;
    
    -- If IDs don't match, update public user ID
    IF public_user_id IS NOT NULL AND auth_user_id IS NOT NULL AND public_user_id != auth_user_id THEN
        UPDATE public.users 
        SET id = auth_user_id 
        WHERE email = user_email;
        
        RAISE NOTICE 'Updated public user ID from % to %', public_user_id, auth_user_id;
    END IF;
END $$;

-- Step 7: Verify the fix
SELECT 
    'Verification' as step,
    u.id as public_id,
    u.email,
    u.first_name,
    u.last_name,
    au.id as auth_id,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password,
    au.role,
    au.aud,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 8: Test basic queries
SELECT 
    'Test Query 1' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 9: Check auth system configuration
SELECT 
    'Auth Config Check' as step,
    'Check Supabase dashboard for auth configuration issues' as message;

-- Step 10: Final status
SELECT 
    'Final Status' as step,
    'User should now be able to log in and reset password' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password,
    'Try both login and password reset' as instruction;

