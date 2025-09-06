-- Simple Test: Bypass RLS to test basic functionality
-- This will help us determine if the issue is with RLS or something else

-- Step 1: Temporarily disable RLS to test basic access
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;

-- Step 2: Test if we can insert a reaction (replace with actual values)
-- You'll need to replace 'your-user-id' and 'your-chirp-id' with real values
-- INSERT INTO public.reactions (user_id, chirp_id) 
-- VALUES ('your-user-id', your-chirp-id);

-- Step 3: Test if we can select reactions
SELECT 
    'Basic Access Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;

-- Step 4: Re-enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a very simple policy that allows everything (for testing)
DROP POLICY IF EXISTS "Test policy" ON public.reactions;
CREATE POLICY "Test policy" ON public.reactions
    FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Test with the permissive policy
SELECT 
    'Permissive Policy Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;

-- Clean up the test policy
DROP POLICY IF EXISTS "Test policy" ON public.reactions;
