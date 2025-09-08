-- Check user ID mismatch between app and database
-- Run this in Supabase SQL Editor to debug the user ID issue

-- Step 1: Check what user ID your app is using
SELECT 
    'App User ID' as info,
    '3497fbed-eeb5-4210-8f4a-b7bd6793846f' as app_user_id,
    'This is the ID your app is using' as note;

-- Step 2: Check what user IDs exist in the notifications table
SELECT 
    'Database User IDs' as info,
    user_id,
    COUNT(*) as notification_count
FROM public.notifications 
GROUP BY user_id
ORDER BY notification_count DESC;

-- Step 3: Check if your app's user ID exists in the users table
SELECT 
    'User Exists Check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f') 
        THEN 'YES - User exists in users table'
        ELSE 'NO - User does not exist in users table'
    END as user_exists;

-- Step 4: Check if your app's user ID exists in the notifications table
SELECT 
    'Notification User Check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.notifications WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f') 
        THEN 'YES - User has notifications'
        ELSE 'NO - User has no notifications'
    END as has_notifications;

-- Step 5: Check the actual user ID format in notifications
SELECT 
    'Notification User ID Format' as info,
    user_id,
    pg_typeof(user_id) as data_type,
    LENGTH(user_id::text) as length
FROM public.notifications 
LIMIT 5;

-- Step 6: Check if there's a data type mismatch
SELECT 
    'Data Type Check' as info,
    'notifications.user_id' as column_name,
    pg_typeof(user_id) as data_type
FROM public.notifications 
LIMIT 1;

-- Step 7: Try to find notifications with a different approach
SELECT 
    'Alternative Query' as info,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as unique_users
FROM public.notifications;

-- Step 8: Check if there are any notifications at all
SELECT 
    'All Notifications' as info,
    id,
    user_id,
    type,
    created_at
FROM public.notifications 
ORDER BY created_at DESC 
LIMIT 10;
