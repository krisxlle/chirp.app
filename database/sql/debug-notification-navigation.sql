-- Test notification navigation by checking actual notification data
-- Run this in Supabase SQL Editor to see what chirp_id values exist

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

-- Check if chirps exist for these chirp_ids
SELECT 
    'Chirps that exist' as info,
    id,
    author_id,
    content,
    created_at
FROM public.chirps 
WHERE id IN (
    SELECT DISTINCT chirp_id 
    FROM public.notifications 
    WHERE chirp_id IS NOT NULL
)
ORDER BY id DESC
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
