-- Test authentication context and RLS policies
-- Run this in Supabase SQL Editor to debug the authentication issue

-- Step 1: Check current authentication context
SELECT 
    'Auth Context' as info,
    auth.uid() as current_user_id,
    auth.role() as current_role,
    'This shows what user Supabase thinks is logged in' as note;

-- Step 2: Test the exact query your app is running
SELECT 
    'App Query Test' as info,
    COUNT(*) as notification_count
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 3: Test with explicit user context
SET LOCAL "request.jwt.claims" TO '{"sub": "3497fbed-eeb5-4210-8f4a-b7bd6793846f"}';
SELECT 
    'With User Context' as info,
    COUNT(*) as notification_count
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 4: Check if RLS is actually working
SELECT 
    'RLS Test' as info,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f') as user_count
FROM public.notifications;

-- Step 5: Test the exact query with RLS bypass (for debugging)
SELECT 
    'RLS Bypass Test' as info,
    id,
    user_id,
    type,
    created_at
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
ORDER BY created_at DESC;

-- Step 6: Check if there's a data type issue
SELECT 
    'Data Type Check' as info,
    user_id,
    pg_typeof(user_id) as data_type,
    user_id::text as as_text,
    '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::uuid as as_uuid
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
LIMIT 1;

-- Step 7: Test with different user ID formats
SELECT 
    'Format Test' as info,
    COUNT(*) as count_text,
    'Testing with text format' as note
FROM public.notifications 
WHERE user_id::text = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

SELECT 
    'Format Test' as info,
    COUNT(*) as count_uuid,
    'Testing with UUID format' as note
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::uuid;
