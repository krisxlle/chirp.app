-- Fix notification chirp_id to point to correct chirps
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: Delete incorrect test notifications
-- ========================================

-- Delete all test notifications
DELETE FROM public.notifications 
WHERE user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
AND from_user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f';

-- ========================================
-- STEP 2: Find the correct chirp_id for notifications
-- ========================================

-- Find the most recent chirp by the target user that was liked by the actor
SELECT 
    'Correct chirp for like notification' as info,
    r.chirp_id,
    c.content,
    c.author_id,
    r.created_at
FROM public.reactions r
LEFT JOIN public.chirps c ON r.chirp_id = c.id
WHERE r.user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND c.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY r.created_at DESC
LIMIT 1;

-- Find the most recent chirp by the target user that was commented on by the actor
SELECT 
    'Correct chirp for comment notification' as info,
    c.reply_to_id as chirp_id,
    parent.content,
    parent.author_id,
    c.created_at
FROM public.chirps c
LEFT JOIN public.chirps parent ON c.reply_to_id = parent.id
WHERE c.author_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND parent.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY c.created_at DESC
LIMIT 1;

-- ========================================
-- STEP 3: Create correct notifications
-- ========================================

-- Create like notification for the correct chirp
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
) 
SELECT 
    'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53',
    '3497fbed-eeb5-4210-8f4a-b7bd6793846f',
    'like',
    r.chirp_id,
    FALSE,
    NOW()
FROM public.reactions r
LEFT JOIN public.chirps c ON r.chirp_id = c.id
WHERE r.user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND c.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY r.created_at DESC
LIMIT 1;

-- Create comment notification for the correct chirp
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
) 
SELECT 
    'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53',
    '3497fbed-eeb5-4210-8f4a-b7bd6793846f',
    'comment',
    c.reply_to_id,
    FALSE,
    NOW()
FROM public.chirps c
LEFT JOIN public.chirps parent ON c.reply_to_id = parent.id
WHERE c.author_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND parent.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY c.created_at DESC
LIMIT 1;

-- Create follow notification
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
) VALUES (
    'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53',
    '3497fbed-eeb5-4210-8f4a-b7bd6793846f',
    'follow',
    NULL,
    FALSE,
    NOW()
);

-- ========================================
-- STEP 4: Verify the correct notifications
-- ========================================

-- Check the created notifications
SELECT 
    'Corrected notifications' as info,
    n.id as notification_id,
    n.type,
    n.chirp_id,
    n.from_user_id,
    n.created_at,
    c.content as chirp_content,
    c.author_id as chirp_author
FROM public.notifications n
LEFT JOIN public.chirps c ON n.chirp_id = c.id
WHERE n.user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY n.created_at DESC
LIMIT 10;

-- Final status
SELECT 
    'Notifications Corrected' as status,
    'Notifications now point to correct chirps' as message,
    'Navigation should work properly now' as note;
