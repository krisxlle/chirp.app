-- IMMEDIATE FIX: Simple RLS Policies for Reactions
-- This should work immediately

-- Step 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Allow all reads" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON public.reactions;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, working policies
-- Policy 1: Allow everyone to read reactions
CREATE POLICY "reactions_select_policy" ON public.reactions
    FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert reactions
CREATE POLICY "reactions_insert_policy" ON public.reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to delete reactions
CREATE POLICY "reactions_delete_policy" ON public.reactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Test the policies
SELECT 
    'Policy Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;
