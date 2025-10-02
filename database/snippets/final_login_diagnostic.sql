-- Final login diagnostic
-- This script provides a comprehensive check of the user and login system

-- Step 1: Check if user exists in auth.users
SELECT 
    'Auth User Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in auth.users'
        ELSE '❌ User missing from auth.users'
    END as status;

-- Step 2: Show detailed user information from auth.users
SELECT 
    'Auth User Details' as step,
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
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Check if user exists in public.users
SELECT 
    'Public User Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User missing from public.users'
    END as status;

-- Step 4: Show detailed user information from public.users
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

-- Step 5: Check if IDs match between tables
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

-- Step 6: Test password verification
SELECT 
    'Password Verification Test' as step,
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test,
    crypt('password123', encrypted_password) as test_hash
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 7: Check RLS policies on public.users
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

-- Step 8: Check RLS status
SELECT 
    'RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 9: Test the exact query that Supabase makes
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

-- Step 10: Try a different password reset approach
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    new_password_hash TEXT;
BEGIN
    -- Generate a new password hash with different salt
    new_password_hash := crypt('password123', gen_salt('bf', 12));
    
    -- Update the password
    UPDATE auth.users 
    SET 
        encrypted_password = new_password_hash,
        updated_at = NOW()
    WHERE email = user_email;
    
    RAISE NOTICE 'Updated password with new hash: %', new_password_hash;
    
    -- Test the new password
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = user_email 
        AND encrypted_password = crypt('password123', encrypted_password)
    ) THEN
        RAISE NOTICE '✅ Password verification successful';
    ELSE
        RAISE NOTICE '❌ Password verification failed';
    END IF;
END $$;

-- Step 11: Final password verification
SELECT 
    'Final Password Check' as step,
    email,
    encrypted_password,
    length(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt,
    updated_at,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 12: Alternative solutions
SELECT 
    'Alternative Solutions' as step,
    'If login is still failing, try these:' as message,
    '1. Use password reset via email' as option1,
    '2. Try magic link login' as option2,
    '3. Check Supabase dashboard for user' as option3,
    '4. Try different browser/incognito' as option4,
    '5. Clear browser cache' as option5,
    '6. Check if user is confirmed' as option6;

-- Step 13: Final status
SELECT 
    'Final Status' as step,
    'User should now be able to log in with:' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;

