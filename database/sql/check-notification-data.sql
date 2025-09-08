-- Check the actual notification data to see chirp_id values
-- Run this in Supabase SQL Editor

-- Check notifications with chirp_id values
SELECT 
    'Notifications with chirp_id' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications 
WHERE chirp_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check for any notifications without chirp_id for like/comment types
SELECT 
    'Notifications missing chirp_id' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications 
WHERE type IN ('like', 'comment') 
AND chirp_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check all notifications for your new user
SELECT 
    'All notifications for new user' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications 
WHERE user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY created_at DESC
LIMIT 10;
