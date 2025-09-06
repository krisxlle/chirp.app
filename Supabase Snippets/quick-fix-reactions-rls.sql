-- Quick Fix for Reactions RLS Policies
-- Run this in your Supabase SQL Editor

-- Enable RLS on reactions table
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- Create new policies
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reactions" ON public.reactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reactions" ON public.reactions
    FOR DELETE USING (auth.uid()::text = user_id);

-- Success!
SELECT 'Reactions RLS policies configured successfully!' as result;
