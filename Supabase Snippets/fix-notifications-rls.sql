-- Fix RLS for notifications table
-- This script enables RLS on the notifications table which has policies but RLS disabled

-- First, let's check the current state of the notifications table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notifications';

-- Check existing policies on notifications table
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
AND tablename = 'notifications'
ORDER BY policyname;

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Verify RLS is now enabled
SELECT 
    'RLS Status Check' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notifications';

-- Check if we need to create any missing policies for notifications
-- Based on the error message, these policies should already exist:
-- - "Notifications are viewable by owner"
-- - "Users can manage own notifications"

-- Let's verify these policies exist and are properly configured
DO $$ 
BEGIN
    -- Check if "Notifications are viewable by owner" exists
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Notifications are viewable by owner') THEN
        CREATE POLICY "Notifications are viewable by owner" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Notifications are viewable by owner';
    ELSE
        RAISE NOTICE 'Policy already exists: Notifications are viewable by owner';
    END IF;

    -- Check if "Users can manage own notifications" exists
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can manage own notifications') THEN
        CREATE POLICY "Users can manage own notifications" ON public.notifications
            FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE 'Created policy: Users can manage own notifications';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can manage own notifications';
    END IF;
END $$;

-- Grant necessary permissions for notifications table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Create index for better performance on notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Final verification - show all policies and RLS status
SELECT 
    'Final Verification' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notifications'
ORDER BY policyname;

-- Show RLS status for all tables
SELECT 
    'RLS Status Summary' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows', 'notifications')
ORDER BY tablename;
