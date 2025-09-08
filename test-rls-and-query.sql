-- Test RLS and query issues
-- Run this in Supabase SQL Editor to debug the query

-- Step 1: Test the exact query your app is using
SELECT 
    'App Query Test' as info,
    COUNT(*) as count,
    'Testing exact app query' as note
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 2: Test with actual data
SELECT 
    'App Query with Data' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
ORDER BY created_at DESC;

-- Step 3: Check RLS policies
SELECT 
    'RLS Policies' as info,
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

-- Step 4: Test as authenticated user (simulate app context)
-- This will show if RLS is blocking the query
SELECT 
    'RLS Test' as info,
    COUNT(*) as accessible_notifications
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 5: Check if notifications table has RLS enabled
SELECT 
    'Table RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notifications';

-- Step 2: Test with actual data
SELECT 
    'App Query with Data' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
ORDER BY created_at DESC;

-- Step 3: Check RLS policies
SELECT 
    'RLS Policies' as info,
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

-- Step 4: Test as authenticated user (simulate app context)
-- This will show if RLS is blocking the query
SELECT 
    'RLS Test' as info,
    COUNT(*) as accessible_notifications
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 5: Check if notifications table has RLS enabled
SELECT 
    'Table RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notifications';
