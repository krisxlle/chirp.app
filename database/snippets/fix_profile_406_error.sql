-- Fix Profile 406 Error
-- The issue is that RLS policies use auth.uid() which returns UUID
-- but the users.id column is varchar, causing comparison failures

-- Step 1: Check current RLS configuration
SELECT 
    'Current RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 2: List existing RLS policies
SELECT 
    'Current Policies' as step,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 3: Temporarily disable RLS to fix the immediate issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 4: Test the basic query that's failing
SELECT 
    'Basic Query Test After Disabling RLS' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 5: Re-enable RLS with corrected policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all operations" ON public.users;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.users;

-- Step 7: Create new policies that handle the UUID/varchar conversion
-- Cast id to UUID for comparison since auth.uid() returns UUID
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id::uuid);

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (auth.uid() = id::uuid);

-- Step 8: Optional - Create a more permissive policy for testing
-- Uncomment this if you want to allow all operations during testing
-- CREATE POLICY "Allow all operations for testing" ON public.users
--     FOR ALL USING (true) WITH CHECK (true);

-- Step 9: Test the corrected query
SELECT 
    'Query Test After Fix' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 10: Verify the auth context
SELECT 
    'Auth Context' as step,
    current_user as current_db_user,
    session_user as session_db_user,
    'Testing auth.uid() function' as note;

-- Step 11: Test auth.uid() in current session
SELECT 
    'Auth UID Test' as step,
    auth.uid() as auth_uuid,
    auth.uid()::text as auth_uuid_as_text,
    'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8' as expected_id,
    CASE 
        WHEN auth.uid()::text = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8' THEN '✅ UUID matches expected ID'
        ELSE '❌ UUID does not match expected ID'
    END as comparison_result;

-- Step 12: Final verification query
SELECT 
    'Final Verification' as step,
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.users WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8') 
        THEN '✅ User exists and query should work'
        ELSE '❌ User does not exist'
    END as user_status,
    'Profile should now load correctly' as expected_result;
