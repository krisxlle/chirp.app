-- DEBUG: Check current policies and fix INSERT issue
-- The SELECT is working but INSERT is still failing

-- Step 1: Check what policies currently exist
SELECT 
    'Current Policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Step 2: Check RLS status
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Step 3: Test current user context
SELECT 
    'Auth Context' as info,
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as current_user;

-- Step 4: Drop all policies and recreate with more explicit checks
DROP POLICY IF EXISTS "reactions_select_policy" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert_policy" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete_policy" ON public.reactions;
DROP POLICY IF EXISTS "simple_select" ON public.reactions;
DROP POLICY IF EXISTS "simple_insert" ON public.reactions;
DROP POLICY IF EXISTS "simple_delete" ON public.reactions;

-- Step 5: Create very explicit policies
CREATE POLICY "allow_all_select" ON public.reactions
    FOR SELECT USING (true);

CREATE POLICY "allow_authenticated_insert" ON public.reactions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "allow_authenticated_delete" ON public.reactions
    FOR DELETE USING (
        auth.uid() IS NOT NULL 
        AND auth.role() = 'authenticated'
    );

-- Step 6: Test the new policies
SELECT 
    'New Policy Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;
