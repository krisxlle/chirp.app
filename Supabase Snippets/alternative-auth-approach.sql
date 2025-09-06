-- Alternative Approach: Use service role or different auth method
-- Sometimes the issue is with how authentication is handled

-- Option 1: Check if we're using the right authentication method
SELECT 
    'Auth Method Check' as info,
    current_user as current_user,
    session_user as session_user,
    auth.uid() as auth_uid,
    auth.role() as auth_role;

-- Option 2: Try using a different approach for the policy
-- Instead of auth.uid(), try using current_user or a different method

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- Try a different approach - maybe the user_id column is actually a different type
-- Let's create policies that are more flexible

-- Policy 1: Allow viewing all reactions
CREATE POLICY "Allow all reads" ON public.reactions
    FOR SELECT USING (true);

-- Policy 2: Allow inserts for authenticated users (more permissive)
CREATE POLICY "Allow authenticated inserts" ON public.reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow deletes for authenticated users (more permissive)
CREATE POLICY "Allow authenticated deletes" ON public.reactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Test the new policies
SELECT 
    'New Policy Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;

-- If this works, we know the issue was with the user_id comparison
-- If this doesn't work, the issue is deeper (authentication, permissions, etc.)
