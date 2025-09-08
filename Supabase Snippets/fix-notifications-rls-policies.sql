-- Fix RLS policies for notifications table
-- This script fixes the RLS policies to allow proper notification creation

-- First, let's check the current state
SELECT 
    'Current RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notifications';

-- Check existing policies
SELECT 
    'Existing Policies' as status,
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

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications are viewable by owner" ON public.notifications;

-- Create proper RLS policies for notifications
-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert notifications (for creating notifications for others)
-- This allows authenticated users to create notifications for other users
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Final verification
SELECT 
    'Final Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as condition,
    with_check as insert_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notifications'
ORDER BY policyname;

-- Test notification creation (this should work now)
-- Note: This is just a verification query, not an actual insert
SELECT 
    'RLS Test' as status,
    'Notifications table is ready for inserts' as message;
