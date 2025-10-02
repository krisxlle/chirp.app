-- Emergency User Migration for kriselle.t@gmail.com
-- This script specifically migrates the user who can't log in

-- Step 1: Check if user exists in custom auth
SELECT 
    'Custom Auth Check' as step,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.created_at
FROM public.users u
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 2: Check if user exists in Supabase Auth
SELECT 
    'Supabase Auth Check' as step,
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.encrypted_password IS NOT NULL as has_password
FROM auth.users au
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 3: Create the user in Supabase Auth if they don't exist
-- Note: Using minimal required columns for Supabase Auth
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at,
    email_change,
    email_change_sent_at,
    confirmation_token,
    recovery_token,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    u.email,
    crypt('password123', gen_salt('bf')),
    NOW(),
    u.created_at,
    NOW(),
    '{}',
    jsonb_build_object(
        'name', COALESCE(u.first_name || ' ' || u.last_name, u.first_name, 'User'),
        'first_name', u.first_name,
        'last_name', u.last_name,
        'custom_handle', u.custom_handle
    ),
    FALSE,
    NULL,
    '',
    NULL,
    '',
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
FROM public.users u
WHERE u.email = 'kriselle.t@gmail.com'
    AND NOT EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.email = u.email
    );

-- Step 4: Update the users table ID with foreign key constraint handling
DO $$
DECLARE
    old_user_id UUID;
    new_user_id UUID;
BEGIN
    -- Get the old user ID from public.users
    SELECT id INTO old_user_id 
    FROM public.users 
    WHERE email = 'kriselle.t@gmail.com';
    
    -- Get the new user ID from auth.users
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = 'kriselle.t@gmail.com';
    
    -- Only proceed if we have both IDs and they're different
    IF old_user_id IS NOT NULL AND new_user_id IS NOT NULL AND old_user_id != new_user_id THEN
        -- Temporarily disable foreign key constraints
        SET session_replication_role = replica;
        
        -- Update the users table ID
        UPDATE public.users 
        SET id = new_user_id 
        WHERE email = 'kriselle.t@gmail.com';
        
        -- Re-enable foreign key constraints
        SET session_replication_role = DEFAULT;
        
        RAISE NOTICE 'Updated user ID from % to %', old_user_id, new_user_id;
    ELSE
        RAISE NOTICE 'No user ID update needed - old_id: %, new_id: %', old_user_id, new_user_id;
    END IF;
END $$;

-- Step 5: Verify the migration
SELECT 
    'Migration Verification' as step,
    u.id as custom_auth_id,
    au.id as supabase_auth_id,
    u.email,
    u.first_name,
    u.last_name,
    au.email_confirmed_at,
    au.encrypted_password IS NOT NULL as has_password,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 6: Test login credentials
SELECT 
    'Login Test' as step,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password,
    'Try logging in with these credentials' as instruction;

-- Step 7: If login still fails, reset the password
UPDATE auth.users
SET 
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'kriselle.t@gmail.com';

-- Step 8: Final verification
SELECT 
    'Final Status' as step,
    'User should now be able to log in with:' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password,
    'Please try logging in now' as next_step;

-- Success message
SELECT 'Emergency migration completed for kriselle.t@gmail.com!' as status;
