-- Comprehensive RLS Fix Script
-- This script addresses all RLS issues: disabled RLS, missing policies, and policy conflicts

-- ========================================
-- STEP 1: Check current RLS status for all tables
-- ========================================
SELECT 
    'Current RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows', 'notifications', 'reactions')
ORDER BY tablename;

-- ========================================
-- STEP 2: Check existing policies
-- ========================================
SELECT 
    'Existing Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows', 'notifications', 'reactions')
ORDER BY tablename, policyname;

-- ========================================
-- STEP 3: Enable RLS on all tables
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chirps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: Create/Verify policies for USERS table
-- ========================================
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

-- ========================================
-- STEP 5: Create/Verify policies for CHIRPS table
-- ========================================
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

-- ========================================
-- STEP 6: Create/Verify policies for FOLLOWS table
-- ========================================
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

-- ========================================
-- STEP 7: Create/Verify policies for NOTIFICATIONS table
-- ========================================
DO $$ 
BEGIN
    -- Notifications are viewable by owner
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Notifications are viewable by owner') THEN
        CREATE POLICY "Notifications are viewable by owner" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Notifications are viewable by owner';
    ELSE
        RAISE NOTICE 'Policy already exists: Notifications are viewable by owner';
    END IF;

    -- Users can manage own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can manage own notifications') THEN
        CREATE POLICY "Users can manage own notifications" ON public.notifications
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can manage own notifications';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can manage own notifications';
    END IF;
END $$;

-- ========================================
-- STEP 7: Create/Verify policies for REACTIONS table
-- ========================================
DO $$ 
BEGIN
    -- Users can view all reactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can view all reactions') THEN
        CREATE POLICY "Users can view all reactions" ON public.reactions
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all reactions';
    END IF;

    -- Users can insert own reactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can insert own reactions') THEN
        CREATE POLICY "Users can insert own reactions" ON public.reactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can insert own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert own reactions';
    END IF;

    -- Users can update own reactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can update own reactions') THEN
        CREATE POLICY "Users can update own reactions" ON public.reactions
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can update own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own reactions';
    END IF;

    -- Users can delete own reactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can delete own reactions') THEN
        CREATE POLICY "Users can delete own reactions" ON public.reactions
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can delete own reactions';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete own reactions';
    END IF;
END $$;

-- ========================================
-- STEP 8: Grant necessary permissions
-- ========================================
-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.chirps TO anon;
GRANT SELECT ON public.follows TO anon;
GRANT SELECT ON public.notifications TO anon;
GRANT SELECT ON public.reactions TO anon;

-- ========================================
-- STEP 9: Create performance indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_chirps_author_id ON public.chirps(author_id);
CREATE INDEX IF NOT EXISTS idx_chirps_reply_to_id ON public.chirps(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chirps_thread_id ON public.chirps(thread_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create reactions indexes safely (check if columns exist first)
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_chirp_id ON public.reactions(chirp_id);

-- Try to create type index only if the column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(type);
        RAISE NOTICE 'Created index: idx_reactions_type';
    ELSE
        RAISE NOTICE 'Column "type" does not exist in reactions table, skipping type index';
    END IF;
END $$;

-- Try to create created_at index only if the column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'reactions' 
               AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON public.reactions(created_at);
        RAISE NOTICE 'Created index: idx_reactions_created_at';
    ELSE
        RAISE NOTICE 'Column "created_at" does not exist in reactions table, skipping created_at index';
    END IF;
END $$;

-- ========================================
-- STEP 10: Final verification
-- ========================================
-- Show final RLS status
SELECT 
    'Final RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows', 'notifications', 'reactions')
ORDER BY tablename;

-- Show all policies
SELECT 
    'Final Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows', 'notifications', 'reactions')
ORDER BY tablename, policyname;

-- Success message
SELECT 'RLS Setup Complete!' as status, 'All tables now have RLS enabled with proper policies' as message;
