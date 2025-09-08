-- Check user ID mismatch in notifications
-- Run this in Supabase SQL Editor to see what's happening

-- Step 1: Check all users and their IDs
SELECT 
    'All Users' as info,
    id,
    email,
    custom_handle,
    handle,
    first_name,
    last_name
FROM public.users
ORDER BY created_at DESC;

-- Step 2: Check all notifications and which users they belong to
SELECT 
    'All Notifications' as info,
    n.id,
    n.user_id,
    n.from_user_id,
    n.type,
    n.chirp_id,
    n.read,
    n.created_at,
    recipient.custom_handle as recipient_handle,
    actor.custom_handle as actor_handle
FROM public.notifications n
LEFT JOIN public.users recipient ON n.user_id = recipient.id
LEFT JOIN public.users actor ON n.from_user_id = actor.id
ORDER BY n.created_at DESC;

-- Step 3: Check if your app's user ID exists in the users table
SELECT 
    'Your App User ID Check' as info,
    CASE 
        WHEN EXISTS(SELECT 1 FROM public.users WHERE id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END as user_exists,
    id,
    email,
    custom_handle,
    handle
FROM public.users 
WHERE id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 4: Check notifications for your specific user ID
SELECT 
    'Notifications for Your User ID' as info,
    COUNT(*) as notification_count
FROM public.notifications 
WHERE user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- Step 5: If no notifications found, check what user IDs DO have notifications
SELECT 
    'Users with Notifications' as info,
    n.user_id,
    u.custom_handle,
    u.handle,
    u.email,
    COUNT(*) as notification_count
FROM public.notifications n
LEFT JOIN public.users u ON n.user_id = u.id
GROUP BY n.user_id, u.custom_handle, u.handle, u.email
ORDER BY notification_count DESC;
