-- Alternative Fix for Reactions RLS Policies
-- This version tries both type casting approaches

-- Enable RLS on reactions table
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- First, let's check the actual data types
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- Create policies with flexible type casting
-- Try UUID comparison first (most common)
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

-- Try both casting approaches
CREATE POLICY "Users can insert own reactions" ON public.reactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id::uuid OR 
        auth.uid()::text = user_id::text
    );

CREATE POLICY "Users can delete own reactions" ON public.reactions
    FOR DELETE USING (
        auth.uid() = user_id::uuid OR 
        auth.uid()::text = user_id::text
    );

-- Success!
SELECT 'Reactions RLS policies configured successfully!' as result;
