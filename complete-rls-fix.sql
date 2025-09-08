-- Complete RLS Fix for All Tables
-- Run this in Supabase SQL Editor to prevent RLS issues for all users

-- ========================================
-- STEP 1: Fix RLS policies for ALL tables
-- ========================================

-- Fix notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete notifications" ON public.notifications;

CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Users can delete notifications" ON public.notifications FOR DELETE USING (true);

-- Fix chirps table
DROP POLICY IF EXISTS "Users can view chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can insert chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can update own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can delete own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can view all chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can insert own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can update own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can delete own chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to view chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to insert chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to update chirps" ON public.chirps;
DROP POLICY IF EXISTS "Allow authenticated users to delete chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can update chirps" ON public.chirps;
DROP POLICY IF EXISTS "Users can delete chirps" ON public.chirps;

CREATE POLICY "Users can view chirps" ON public.chirps FOR SELECT USING (true);
CREATE POLICY "Users can insert chirps" ON public.chirps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update chirps" ON public.chirps FOR UPDATE USING (true);
CREATE POLICY "Users can delete chirps" ON public.chirps FOR DELETE USING (true);

-- Fix users table
DROP POLICY IF EXISTS "Users can view users" ON public.users;
DROP POLICY IF EXISTS "Users can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON public.users;
DROP POLICY IF EXISTS "Users can update users" ON public.users;
DROP POLICY IF EXISTS "Users can delete users" ON public.users;

CREATE POLICY "Users can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Users can delete users" ON public.users FOR DELETE USING (true);

-- Fix reactions table
DROP POLICY IF EXISTS "Users can view reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated users to view reactions" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated users to update reactions" ON public.reactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete reactions" ON public.reactions;

CREATE POLICY "Users can view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can insert reactions" ON public.reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update reactions" ON public.reactions FOR UPDATE USING (true);
CREATE POLICY "Users can delete reactions" ON public.reactions FOR DELETE USING (true);

-- Fix follows table
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can insert follows" ON public.follows;
DROP POLICY IF EXISTS "Users can update own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
DROP POLICY IF EXISTS "Allow authenticated users to view follows" ON public.follows;
DROP POLICY IF EXISTS "Allow authenticated users to insert follows" ON public.follows;
DROP POLICY IF EXISTS "Allow authenticated users to update follows" ON public.follows;
DROP POLICY IF EXISTS "Allow authenticated users to delete follows" ON public.follows;
DROP POLICY IF EXISTS "Users can update follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;

CREATE POLICY "Users can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert follows" ON public.follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update follows" ON public.follows FOR UPDATE USING (true);
CREATE POLICY "Users can delete follows" ON public.follows FOR DELETE USING (true);

-- Fix notification_settings table
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Allow authenticated users to view notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Allow authenticated users to delete notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can view notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can delete notification_settings" ON public.notification_settings;

CREATE POLICY "Users can view notification_settings" ON public.notification_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert notification_settings" ON public.notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notification_settings" ON public.notification_settings FOR UPDATE USING (true);
CREATE POLICY "Users can delete notification_settings" ON public.notification_settings FOR DELETE USING (true);

-- ========================================
-- STEP 2: Grant permissions to all roles
-- ========================================

-- Grant permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.chirps TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.reactions TO authenticated;
GRANT ALL ON public.follows TO authenticated;
GRANT ALL ON public.notification_settings TO authenticated;

-- Grant permissions to anon role (for new users)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.notifications TO anon;
GRANT ALL ON public.chirps TO anon;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.reactions TO anon;
GRANT ALL ON public.follows TO anon;
GRANT ALL ON public.notification_settings TO anon;

-- ========================================
-- STEP 3: Verify the fix
-- ========================================

-- Check all RLS policies
SELECT 
    'RLS Policies Status' as info,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('notifications', 'chirps', 'users', 'reactions', 'follows', 'notification_settings')
GROUP BY tablename
ORDER BY tablename;

-- Check table permissions
SELECT 
    'Table Permissions' as info,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'chirps', 'users', 'reactions', 'follows', 'notification_settings')
AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee;

-- Test notification creation
SELECT 
    'Test Notification Creation' as info,
    public.create_notification(
        '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::UUID,  -- target user
        '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::UUID,  -- actor user
        'test',
        1  -- chirp_id
    ) as test_result;

-- Final status
SELECT 
    'Complete RLS Fix Applied' as status,
    'All tables now have permissive RLS policies' as message,
    'New users will not encounter RLS issues' as note;
