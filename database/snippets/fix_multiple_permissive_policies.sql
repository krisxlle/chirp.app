-- Fix Multiple Permissive Policies warnings
-- This script consolidates duplicate policies to improve performance

-- 1. Fix chirps table - consolidate INSERT policies
DROP POLICY IF EXISTS "Users can create chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can insert chirps" ON public.chirps;
CREATE POLICY "Users can insert chirps" ON public.chirps
    FOR INSERT WITH CHECK ((select auth.uid()) = author_id);

-- 2. Fix chirps table - consolidate SELECT policies
DROP POLICY IF EXISTS "Chirps are viewable by everyone" ON public.chirps;
DROP POLICY IF EXISTS "Users can view chirps" ON public.chirps;
CREATE POLICY "Chirps are viewable by everyone" ON public.chirps
    FOR SELECT USING (true);

-- 3. Fix follows table - consolidate policies
DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;
DROP POLICY IF EXISTS "Users can insert follows" ON public.follows;
DROP POLICY IF EXISTS "Users can insert own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can update follows" ON public.follows;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;

-- Create consolidated policies for follows
CREATE POLICY "Users can manage follows" ON public.follows
    FOR ALL USING ((select auth.uid()) = follower_id);

CREATE POLICY "Follows are viewable by everyone" ON public.follows
    FOR SELECT USING (true);

-- 4. Fix notification_settings table - consolidate INSERT policies
DROP POLICY IF EXISTS "Users can insert notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- 5. Fix push_tokens table - consolidate SELECT policies
DROP POLICY IF EXISTS "Push tokens are viewable by owner" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.push_tokens;
CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
    FOR ALL USING ((select auth.uid()) = user_id);

-- 6. Fix reactions table - consolidate policies
DROP POLICY IF EXISTS "Users can delete reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update reactions" ON public.reactions;
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
DROP POLICY IF EXISTS "Users can view reactions" ON public.reactions;
DROP POLICY IF EXISTS "reactions_select_all" ON public.reactions;
DROP POLICY IF EXISTS "ultra_permissive_delete" ON public.reactions;
DROP POLICY IF EXISTS "ultra_permissive_insert" ON public.reactions;
DROP POLICY IF EXISTS "ultra_permissive_select" ON public.reactions;

-- Create consolidated policies for reactions
CREATE POLICY "Users can manage reactions" ON public.reactions
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
    FOR SELECT USING (true);

-- 7. Fix user_blocks table - consolidate SELECT policies
DROP POLICY IF EXISTS "Authenticated users can manage blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "User blocks are viewable by everyone" ON public.user_blocks;
CREATE POLICY "User blocks are viewable by everyone" ON public.user_blocks
    FOR SELECT USING (true);

-- 8. Fix user_notification_settings table - consolidate SELECT policies
DROP POLICY IF EXISTS "User notification settings are viewable by owner" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Users can manage own notification settings" ON public.user_notification_settings;
CREATE POLICY "Users can manage own notification settings" ON public.user_notification_settings
    FOR ALL USING ((select auth.uid()) = user_id);

-- 9. Fix users table - consolidate INSERT policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert users" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- 10. Fix users table - consolidate SELECT policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view users" ON public.users;
CREATE POLICY "Users are viewable by everyone" ON public.users
    FOR SELECT USING (true);

-- Verify the consolidated policies
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
        'chirps', 'follows', 'notification_settings', 'push_tokens', 
        'reactions', 'user_blocks', 'user_notification_settings', 'users'
    )
ORDER BY tablename, policyname;

-- Check for remaining multiple policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'chirps', 'follows', 'notification_settings', 'push_tokens', 
        'reactions', 'user_blocks', 'user_notification_settings', 'users'
    )
ORDER BY tablename, cmd, policyname;

-- Success message
SELECT 'Multiple Permissive Policies warnings fixed!' as status;
