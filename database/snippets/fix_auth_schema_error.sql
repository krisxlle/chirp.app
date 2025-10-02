-- Fix authentication schema error
-- This script addresses potential issues causing "Database error querying schema"

-- Step 1: Ensure user exists in both tables with matching IDs
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
    
    -- Get the public user ID
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    -- If auth user exists but public user doesn't, create it
    IF auth_user_id IS NOT NULL AND public_user_id IS NULL THEN
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
        RAISE NOTICE 'Created public user for %', user_email;
    END IF;
    
    -- If both exist but IDs don't match, update public user ID
    IF auth_user_id IS NOT NULL AND public_user_id IS NOT NULL AND auth_user_id != public_user_id THEN
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

-- Step 2: Ensure RLS policies are correct for users table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify the user setup
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

-- Step 5: Test the user query that Supabase might be making
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

-- Step 6: Check RLS status
SELECT 
    'RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

