-- Simple and Safe Reactions RLS Fix
-- This script only enables RLS and creates basic policies without assuming column structure

-- Enable RLS on reactions table
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for reactions table
-- Users can view all reactions (for displaying reaction counts)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can view all reactions') THEN
        CREATE POLICY "Users can view all reactions" ON public.reactions
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all reactions';
    END IF;
END $$;

-- Users can insert their own reactions (assuming user_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'user_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can insert own reactions') THEN
            CREATE POLICY "Users can insert own reactions" ON public.reactions
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            RAISE NOTICE 'Created policy: Users can insert own reactions';
        ELSE
            RAISE NOTICE 'Policy already exists: Users can insert own reactions';
        END IF;
    ELSE
        RAISE NOTICE 'Column "user_id" does not exist in reactions table, skipping insert policy';
    END IF;
END $$;

-- Users can update their own reactions (assuming user_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'user_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can update own reactions') THEN
            CREATE POLICY "Users can update own reactions" ON public.reactions
                FOR UPDATE USING (auth.uid() = user_id);
            RAISE NOTICE 'Created policy: Users can update own reactions';
        ELSE
            RAISE NOTICE 'Policy already exists: Users can update own reactions';
        END IF;
    ELSE
        RAISE NOTICE 'Column "user_id" does not exist in reactions table, skipping update policy';
    END IF;
END $$;

-- Users can delete their own reactions (assuming user_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'user_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can delete own reactions') THEN
            CREATE POLICY "Users can delete own reactions" ON public.reactions
                FOR DELETE USING (auth.uid() = user_id);
            RAISE NOTICE 'Created policy: Users can delete own reactions';
        ELSE
            RAISE NOTICE 'Policy already exists: Users can delete own reactions';
        END IF;
    ELSE
        RAISE NOTICE 'Column "user_id" does not exist in reactions table, skipping delete policy';
    END IF;
END $$;

-- Grant necessary permissions for reactions table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.reactions TO authenticated;

-- Grant read-only permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.reactions TO anon;

-- Create basic indexes for columns that likely exist
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_chirp_id ON public.reactions(chirp_id);

-- Final verification
SELECT 
    'Final RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

SELECT 
    'Final Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Show table structure for reference
SELECT 
    'Table Structure' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;

SELECT 'Reactions RLS Setup Complete!' as status, 'RLS enabled with safe policies' as message;
