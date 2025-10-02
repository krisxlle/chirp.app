-- Diagnose login issue
-- This script helps identify why login is still failing

-- Step 1: Check user existence and status
SELECT 
    'User Existence Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in auth.users'
        ELSE '❌ User missing from auth.users'
    END as auth_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User missing from public.users'
    END as public_status;

-- Step 2: Get detailed user information
SELECT 
    'Detailed User Info' as step,
    au.id as auth_id,
    au.email,
    au.encrypted_password,
    au.email_confirmed_at,
    au.created_at as auth_created_at,
    au.updated_at as auth_updated_at,
    au.role,
    au.aud,
    au.raw_user_meta_data,
    au.raw_app_meta_data,
    u.id as public_id,
    u.first_name,
    u.last_name,
    u.handle,
    u.created_at as public_created_at,
    u.updated_at as public_updated_at
FROM auth.users au
FULL OUTER JOIN public.users u ON au.email = u.email
WHERE au.email = 'kriselle.t@gmail.com' OR u.email = 'kriselle.t@gmail.com';

-- Step 3: Check password format and length
SELECT 
    'Password Analysis' as step,
    email,
    encrypted_password,
    length(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt,
    encrypted_password LIKE '$2a%' as is_bcrypt_2a,
    encrypted_password LIKE '$2b%' as is_bcrypt_2b,
    encrypted_password LIKE '$2y%' as is_bcrypt_2y,
    CASE 
        WHEN encrypted_password IS NULL THEN '❌ No password'
        WHEN length(encrypted_password) < 20 THEN '❌ Password too short'
        WHEN encrypted_password LIKE '$2%' THEN '✅ Bcrypt format'
        ELSE '⚠️ Unknown format'
    END as password_status
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 4: Test password verification
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

-- Step 5: Check for any constraints or triggers that might affect login
SELECT 
    'Constraint Check' as step,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
    AND constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY');

-- Step 6: Check for any triggers on auth.users
SELECT 
    'Trigger Check' as step,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
    AND event_object_table = 'users'
ORDER BY trigger_name;

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

-- Step 8: Try a different password reset approach
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    new_password_hash TEXT;
BEGIN
    -- Generate a new password hash
    new_password_hash := crypt('password123', gen_salt('bf', 12));
    
    -- Update the password
    UPDATE auth.users 
    SET 
        encrypted_password = new_password_hash,
        updated_at = NOW()
    WHERE email = user_email;
    
    RAISE NOTICE 'Updated password with hash: %', new_password_hash;
    
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

-- Step 9: Final verification after password update
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

-- Step 10: Check if there are any system-level issues
SELECT 
    'System Check' as step,
    'If login is still failing, check:' as message,
    '1. Supabase project status' as item1,
    '2. Auth service configuration' as item2,
    '3. Rate limiting' as item3,
    '4. Network connectivity' as item4,
    '5. Browser cache/cookies' as item5;

-- Step 11: Alternative login methods
SELECT 
    'Alternative Solutions' as step,
    'Try these alternatives:' as message,
    '1. Use password reset via email' as option1,
    '2. Try magic link login' as option2,
    '3. Check Supabase dashboard for user' as option3,
    '4. Try different browser/incognito' as option4,
    '5. Clear browser cache' as option5;
