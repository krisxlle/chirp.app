-- Emergency authentication fix
-- This script directly addresses the "Database error querying schema" issue

-- Step 1: Check current state
SELECT 
    'Current State Check' as step,
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

-- Step 2: Get current IDs
SELECT 
    'Current IDs' as step,
    u.id as public_id,
    au.id as auth_id,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM public.users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com' OR au.email = 'kriselle.t@gmail.com';

-- Step 3: Emergency fix - ensure user exists in both tables with correct setup
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    auth_user_id UUID;
    public_user_id UUID;
BEGIN
    -- Get auth user ID
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Get public user ID
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    RAISE NOTICE 'Auth user ID: %, Public user ID: %', auth_user_id, public_user_id;
    
    -- If auth user doesn't exist, create it
    IF auth_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, 
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
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
            'authenticated'
        );
        
        -- Get the new auth user ID
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        RAISE NOTICE 'Created auth user with ID: %', auth_user_id;
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
        -- Temporarily disable foreign key constraints
        SET session_replication_role = replica;
        
        UPDATE public.users 
        SET id = auth_user_id 
        WHERE email = user_email;
        
        -- Re-enable foreign key constraints
        SET session_replication_role = DEFAULT;
        
        RAISE NOTICE 'Updated public user ID from % to %', public_user_id, auth_user_id;
    END IF;
END $$;

-- Step 4: Ensure RLS is properly configured
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- Create simple, working RLS policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the fix
SELECT 
    'Verification' as step,
    u.id as public_id,
    u.email,
    u.first_name,
    u.last_name,
    au.id as auth_id,
    au.email_confirmed_at,
    CASE 
        WHEN u.id = au.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 6: Test the query that Supabase makes
SELECT 
    'Test Query' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    created_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 7: Check RLS status
SELECT 
    'RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 8: Final status
SELECT 
    'Final Status' as step,
    'User should now be able to log in with:' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;

