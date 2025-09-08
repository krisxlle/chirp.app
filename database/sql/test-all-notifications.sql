-- Test all notification types
-- Run this in Supabase SQL Editor to check if all notification types are working

-- Step 1: Check what notification types exist in the database
SELECT 
    'Notification Types Check' as info,
    type,
    COUNT(*) as count
FROM public.notifications 
GROUP BY type
ORDER BY count DESC;

-- Step 2: Check recent notifications (last 24 hours)
SELECT 
    'Recent Notifications' as info,
    id,
    type,
    user_id,
    from_user_id,
    chirp_id,
    created_at
FROM public.notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Check if triggers are active
SELECT 
    'Active Triggers' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%notify%'
ORDER BY trigger_name;

-- Step 4: Test notification creation function
SELECT 
    'Test Notification Creation' as info,
    public.create_notification(
        '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::UUID,  -- target user
        '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::UUID,  -- actor user (same user for test)
        'test',
        1  -- chirp_id
    ) as test_result;

-- Step 5: Check notification settings
SELECT 
    'Notification Settings' as info,
    user_id,
    likes_enabled,
    comments_enabled,
    follows_enabled,
    mentions_enabled
FROM public.notification_settings
LIMIT 5;
