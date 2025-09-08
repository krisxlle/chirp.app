-- Safe RLS Policy Creation Script
-- This script checks for existing policies and only creates missing ones

-- First, let's see what policies already exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows')
ORDER BY tablename, policyname;

-- Enable RLS on tables (safe to run multiple times)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chirps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create missing policies for users table
DO $$ 
BEGIN
    -- Users can view all profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON public.users
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all profiles';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all profiles';
    END IF;

    -- Users can update own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can update own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own profile';
    END IF;

    -- Users can insert own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can insert own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert own profile';
    END IF;
END $$;

-- Create missing policies for chirps table
DO $$ 
BEGIN
    -- Users can view all chirps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can view all chirps') THEN
        CREATE POLICY "Users can view all chirps" ON public.chirps
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all chirps';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all chirps';
    END IF;

    -- Users can insert own chirps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can insert own chirps') THEN
        CREATE POLICY "Users can insert own chirps" ON public.chirps
            FOR INSERT WITH CHECK (auth.uid() = author_id);
        RAISE NOTICE 'Created policy: Users can insert own chirps';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert own chirps';
    END IF;

    -- Users can update own chirps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can update own chirps') THEN
        CREATE POLICY "Users can update own chirps" ON public.chirps
            FOR UPDATE USING (auth.uid() = author_id);
        RAISE NOTICE 'Created policy: Users can update own chirps';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own chirps';
    END IF;

    -- Users can delete own chirps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can delete own chirps') THEN
        CREATE POLICY "Users can delete own chirps" ON public.chirps
            FOR DELETE USING (auth.uid() = author_id);
        RAISE NOTICE 'Created policy: Users can delete own chirps';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete own chirps';
    END IF;
END $$;

-- Create missing policies for follows table
DO $$ 
BEGIN
    -- Users can view all follows
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can view all follows') THEN
        CREATE POLICY "Users can view all follows" ON public.follows
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all follows';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all follows';
    END IF;

    -- Users can insert own follows
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can insert own follows') THEN
        CREATE POLICY "Users can insert own follows" ON public.follows
            FOR INSERT WITH CHECK (auth.uid() = follower_id);
        RAISE NOTICE 'Created policy: Users can insert own follows';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert own follows';
    END IF;

    -- Users can delete own follows
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can delete own follows') THEN
        CREATE POLICY "Users can delete own follows" ON public.follows
            FOR DELETE USING (auth.uid() = follower_id);
        RAISE NOTICE 'Created policy: Users can delete own follows';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete own follows';
    END IF;
END $$;

-- Grant necessary permissions (safe to run multiple times)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.chirps TO anon;
GRANT SELECT ON public.follows TO anon;

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_chirps_author_id ON public.chirps(author_id);
CREATE INDEX IF NOT EXISTS idx_chirps_reply_to_id ON public.chirps(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chirps_thread_id ON public.chirps(thread_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Final verification - show all policies
SELECT 
    'Final Policy Check' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows')
ORDER BY tablename, policyname;
