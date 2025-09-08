-- Fix RLS policies for notifications
-- Run this in Supabase SQL Editor to fix the notification access issue

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications are viewable by owner" ON public.notifications;

-- Step 2: Create new policies that work with your app
-- Policy 1: Allow authenticated users to view notifications
CREATE POLICY "Allow authenticated users to view notifications" ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow authenticated users to insert notifications
CREATE POLICY "Allow authenticated users to insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update notifications
CREATE POLICY "Allow authenticated users to update notifications" ON public.notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete notifications
CREATE POLICY "Allow authenticated users to delete notifications" ON public.notifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Step 4: Test the fix
SELECT 
    'RLS Fix Applied' as status,
    'Policies updated to allow authenticated access' as message;

-- Step 5: Verify policies were created
SELECT 
    'New RLS Policies' as info,
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notifications'
ORDER BY policyname;
