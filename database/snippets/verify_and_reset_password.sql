-- Verify user and reset password
-- This script checks the user status and resets the password

-- Step 1: Check current user status
SELECT 
    'Current User Status' as step,
    u.id as public_id,
    u.email,
    u.first_name,
    u.last_name,
    au.id as auth_id,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password,
    au.role,
    au.aud,
    au.created_at as auth_created_at,
    au.updated_at as auth_updated_at,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 2: Check if password is properly encrypted
SELECT 
    'Password Check' as step,
    email,
    encrypted_password,
    length(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt,
    CASE 
        WHEN encrypted_password IS NULL THEN '❌ No password'
        WHEN length(encrypted_password) < 20 THEN '❌ Password too short'
        WHEN encrypted_password LIKE '$2%' THEN '✅ Bcrypt format'
        ELSE '⚠️ Unknown format'
    END as password_status
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Reset password with proper encryption
UPDATE auth.users 
SET 
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'kriselle.t@gmail.com';

-- Step 4: Verify password was updated
SELECT 
    'Password Update Verification' as step,
    email,
    encrypted_password,
    length(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt,
    updated_at
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 5: Test password verification
SELECT 
    'Password Verification Test' as step,
    email,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 6: Check if user is properly confirmed
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'kriselle.t@gmail.com';

-- Step 7: Final verification
SELECT 
    'Final Verification' as step,
    u.id as public_id,
    u.email,
    u.first_name,
    u.last_name,
    au.id as auth_id,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password,
    au.role,
    au.aud,
    au.updated_at as auth_updated_at,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
        ELSE '❌ Email not confirmed'
    END as email_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 8: Test the user query that Supabase makes
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

-- Step 9: Status message
SELECT 
    'Final Status' as step,
    'Password reset and user confirmed, try login now' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;
