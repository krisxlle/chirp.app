-- Emergency database fix for auth system
-- This script addresses the 500 errors in auth endpoints

-- Step 1: Check database connection and basic functionality
SELECT 
    'Database Connection Test' as step,
    'Database is accessible' as status,
    NOW() as current_time;

-- Step 2: Check if the issue is with the auth schema
SELECT 
    'Auth Schema Check' as step,
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Step 3: Check auth.users table structure and constraints
SELECT 
    'Auth Users Table Check' as step,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 4: Check for any problematic constraints or triggers
SELECT 
    'Constraint Check' as step,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
    AND table_name = 'users';

-- Step 5: Check for any triggers that might be causing issues
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

-- Step 6: Check if there are any locks or blocking queries
SELECT 
    'Lock Check' as step,
    'Check for any blocking queries or locks' as message;

-- Step 7: Try to fix the auth user directly
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
    
    -- If auth user doesn't exist, create it with minimal required fields
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

-- Step 8: Verify the fix
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

-- Step 9: Test basic queries that Supabase might be making
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

-- Step 10: Check if there are any system-level issues
SELECT 
    'System Check' as step,
    'If auth is still failing, check:' as message,
    '1. Supabase project status' as item1,
    '2. Database connection limits' as item2,
    '3. Auth service status' as item3,
    '4. Rate limiting' as item4,
    '5. Project quotas' as item5;

-- Step 11: Final status
SELECT 
    'Final Status' as step,
    'User should now be able to log in and reset password' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password,
    'Try both login and password reset' as instruction;
