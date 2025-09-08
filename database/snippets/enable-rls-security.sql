-- Enable Row Level Security (RLS) for all public tables
-- This script addresses the security warning about RLS not being enabled

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chirps table
ALTER TABLE public.chirps ENABLE ROW LEVEL SECURITY;

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table (with IF NOT EXISTS check)
-- Users can view all user profiles (for profile pages)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON public.users
            FOR SELECT USING (true);
    END IF;
END $$;

-- Users can only update their own profile
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Users can insert their own profile (during signup)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Create RLS policies for chirps table
-- Users can view all chirps (for feeds)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can view all chirps') THEN
        CREATE POLICY "Users can view all chirps" ON public.chirps
            FOR SELECT USING (true);
    END IF;
END $$;

-- Users can only insert chirps as themselves
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can insert own chirps') THEN
        CREATE POLICY "Users can insert own chirps" ON public.chirps
            FOR INSERT WITH CHECK (auth.uid() = author_id);
    END IF;
END $$;

-- Users can only update their own chirps
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can update own chirps') THEN
        CREATE POLICY "Users can update own chirps" ON public.chirps
            FOR UPDATE USING (auth.uid() = author_id);
    END IF;
END $$;

-- Users can only delete their own chirps
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chirps' AND policyname = 'Users can delete own chirps') THEN
        CREATE POLICY "Users can delete own chirps" ON public.chirps
            FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

-- Create RLS policies for follows table
-- Users can view all follow relationships
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can view all follows') THEN
        CREATE POLICY "Users can view all follows" ON public.follows
            FOR SELECT USING (true);
    END IF;
END $$;

-- Users can only create follow relationships as themselves
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can insert own follows') THEN
        CREATE POLICY "Users can insert own follows" ON public.follows
            FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;
END $$;

-- Users can only delete their own follow relationships
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can delete own follows') THEN
        CREATE POLICY "Users can delete own follows" ON public.follows
            FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END $$;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary permissions to anon users (for public read access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.chirps TO anon;
GRANT SELECT ON public.follows TO anon;

-- Create indexes for better performance with RLS
CREATE INDEX IF NOT EXISTS idx_chirps_author_id ON public.chirps(author_id);
CREATE INDEX IF NOT EXISTS idx_chirps_reply_to_id ON public.chirps(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chirps_thread_id ON public.chirps(thread_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Add comments for documentation
COMMENT ON POLICY "Users can view all profiles" ON public.users IS 'Allows users to view any user profile for profile pages and search';
COMMENT ON POLICY "Users can update own profile" ON public.users IS 'Users can only modify their own profile information';
COMMENT ON POLICY "Users can insert own profile" ON public.users IS 'Users can create their own profile during signup';
COMMENT ON POLICY "Users can view all chirps" ON public.chirps IS 'Allows users to view all chirps in feeds and individual views';
COMMENT ON POLICY "Users can insert own chirps" ON public.chirps IS 'Users can only post chirps as themselves';
COMMENT ON POLICY "Users can update own chirps" ON public.chirps IS 'Users can only edit their own chirps';
COMMENT ON POLICY "Users can delete own chirps" ON public.chirps IS 'Users can only delete their own chirps';
COMMENT ON POLICY "Users can view all follows" ON public.follows IS 'Allows users to see follow relationships for profile stats';
COMMENT ON POLICY "Users can insert own follows" ON public.follows IS 'Users can only follow others as themselves';
COMMENT ON POLICY "Users can delete own follows" ON public.follows IS 'Users can only unfollow as themselves';
