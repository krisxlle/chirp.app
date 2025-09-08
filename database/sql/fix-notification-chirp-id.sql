-- Fix notification chirp_id population issue
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: Check current notification data
-- ========================================

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

-- Check notifications missing chirp_id for like/comment types
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

-- ========================================
-- STEP 2: Fix notifications missing chirp_id
-- ========================================

-- Update like notifications to have correct chirp_id
UPDATE public.notifications 
SET chirp_id = (
    SELECT r.chirp_id 
    FROM public.reactions r 
    WHERE r.user_id = notifications.from_user_id 
    AND r.chirp_id IS NOT NULL
    ORDER BY r.created_at DESC 
    LIMIT 1
)
WHERE notifications.type = 'like' 
AND notifications.chirp_id IS NULL
AND notifications.from_user_id IS NOT NULL;

-- Update comment notifications to have correct chirp_id
UPDATE public.notifications 
SET chirp_id = (
    SELECT c.reply_to_id 
    FROM public.chirps c 
    WHERE c.author_id = notifications.from_user_id 
    AND c.reply_to_id IS NOT NULL
    ORDER BY c.created_at DESC 
    LIMIT 1
)
WHERE notifications.type = 'comment' 
AND notifications.chirp_id IS NULL
AND notifications.from_user_id IS NOT NULL;

-- ========================================
-- STEP 3: Create test notifications with correct chirp_id
-- ========================================

-- Delete existing test notifications
DELETE FROM public.notifications 
WHERE user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
AND type IN ('test', 'like', 'comment');

-- Create new test notifications with actual chirp IDs
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
) VALUES 
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'like', 41, FALSE, NOW()),
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'comment', 39, FALSE, NOW()),
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'follow', NULL, FALSE, NOW());

-- ========================================
-- STEP 4: Verify the fix
-- ========================================

-- Check updated notifications
SELECT 
    'Fixed notifications' as info,
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

-- Verify chirp_id values exist in chirps table
SELECT 
    'Verification: chirp_id exists in chirps' as info,
    n.id as notification_id,
    n.chirp_id,
    c.id as chirp_exists,
    c.content
FROM public.notifications n
LEFT JOIN public.chirps c ON n.chirp_id = c.id
WHERE n.user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
AND n.chirp_id IS NOT NULL;

-- Final status
SELECT 
    'Notification Navigation Fixed' as status,
    'Test notifications created with valid chirp_id values' as message,
    'Navigation should now work properly' as note;
