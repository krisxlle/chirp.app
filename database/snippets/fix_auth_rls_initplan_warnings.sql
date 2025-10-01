-- Fix Auth RLS Initialization Plan warnings
-- This script optimizes RLS policies by replacing auth.uid() with (select auth.uid())
-- to prevent re-evaluation for each row

-- 1. Fix push_tokens table policies
DROP POLICY IF EXISTS "Push tokens are viewable by owner" ON public.push_tokens;
CREATE POLICY "Push tokens are viewable by owner" ON public.push_tokens
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.push_tokens;
CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
    FOR ALL USING ((select auth.uid()) = user_id);

-- 2. Fix user_notification_settings table policies
DROP POLICY IF EXISTS "User notification settings are viewable by owner" ON public.user_notification_settings;
CREATE POLICY "User notification settings are viewable by owner" ON public.user_notification_settings
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own notification settings" ON public.user_notification_settings
    FOR ALL USING ((select auth.uid()) = user_id);

-- 3. Fix user_collections table policies
DROP POLICY IF EXISTS "Users can add to their own collections" ON public.user_collections;
CREATE POLICY "Users can add to their own collections" ON public.user_collections
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.user_collections;
CREATE POLICY "Users can delete their own collections" ON public.user_collections
    FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON public.user_collections;
CREATE POLICY "Users can update their own collections" ON public.user_collections
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own collections" ON public.user_collections;
CREATE POLICY "Users can view their own collections" ON public.user_collections
    FOR SELECT USING ((select auth.uid()) = user_id);

-- 4. Fix chirps table policies
DROP POLICY IF EXISTS "Users can create chirps" ON public.chirps;
CREATE POLICY "Users can create chirps" ON public.chirps
    FOR INSERT WITH CHECK ((select auth.uid()) = author_id);

-- 5. Fix reposts table policies
DROP POLICY IF EXISTS "Users can create their own reposts" ON public.reposts;
CREATE POLICY "Users can create their own reposts" ON public.reposts
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own reposts" ON public.reposts;
CREATE POLICY "Users can delete their own reposts" ON public.reposts
    FOR DELETE USING ((select auth.uid()) = user_id);

-- 6. Fix follows table policies
DROP POLICY IF EXISTS "Users can insert own follows" ON public.follows;
CREATE POLICY "Users can insert own follows" ON public.follows
    FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can manage follows" ON public.follows;
CREATE POLICY "Users can manage follows" ON public.follows
    FOR ALL USING ((select auth.uid()) = follower_id);

-- 7. Fix notification_settings table policies
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 8. Fix users table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- 9. Fix profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- 10. Fix reactions table policies
DROP POLICY IF EXISTS "Users can manage reactions" ON public.reactions;
CREATE POLICY "Users can manage reactions" ON public.reactions
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reactions_delete_own" ON public.reactions;
CREATE POLICY "reactions_delete_own" ON public.reactions
    FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reactions_insert_auth" ON public.reactions;
CREATE POLICY "reactions_insert_auth" ON public.reactions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 11. Fix feedback table policies
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
CREATE POLICY "Users can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Verify the policies have been updated
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
    AND tablename IN (
        'push_tokens', 'user_notification_settings', 'user_collections', 
        'chirps', 'reposts', 'follows', 'notification_settings', 
        'users', 'profiles', 'reactions', 'feedback'
    )
ORDER BY tablename, policyname;

-- Success message
SELECT 'Auth RLS Initialization Plan warnings fixed!' as status;
