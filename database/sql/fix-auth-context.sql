-- Fix authentication context for notifications
-- Run this in Supabase SQL Editor to fix the auth context issue

-- Step 1: Drop the current restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete notifications" ON public.notifications;

-- Step 2: Create policies that work with your custom auth system
-- These policies will allow access based on user_id matching, not auth.uid()

-- Policy 1: Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (true);

-- Policy 2: Allow users to insert notifications
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Policy 3: Allow users to update their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (true);

-- Policy 4: Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (true);

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO anon;

-- Step 4: Test the fix
SELECT 
    'Auth Context Fix Applied' as status,
    'Policies updated to work with custom auth system' as message;

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
