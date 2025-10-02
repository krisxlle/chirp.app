-- Quick Password Reset for Specific User
-- This script resets the password for kriselle.t@gmail.com

-- Step 1: Check current user status
SELECT 
    'Current Status' as info,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.encrypted_password IS NOT NULL as has_password,
    au.last_sign_in_at
FROM auth.users au
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 2: Reset password to a known value
UPDATE auth.users
SET 
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Verify password was updated
SELECT 
    'Password Reset Complete' as status,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as new_password,
    'Please try logging in now' as instruction;

-- Step 4: Check if user exists in custom auth table
SELECT 
    'Custom Auth User' as info,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle
FROM public.users u
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 5: Ensure user ID matches between tables
UPDATE public.users 
SET id = (
    SELECT au.id::TEXT 
    FROM auth.users au 
    WHERE au.email = 'kriselle.t@gmail.com'
)
WHERE email = 'kriselle.t@gmail.com';

-- Step 6: Final verification
SELECT 
    'Final Verification' as step,
    u.id as custom_auth_id,
    au.id as supabase_auth_id,
    u.email,
    CASE 
        WHEN u.id::UUID = au.id THEN '✅ IDs match - Ready to login'
        ELSE '❌ IDs still mismatch'
    END as status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Success message
SELECT 'Password reset completed! Try logging in with password123' as status;
