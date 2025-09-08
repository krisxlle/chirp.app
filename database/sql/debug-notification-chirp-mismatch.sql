-- Debug notification chirp_id mismatch issue
-- Run this in Supabase SQL Editor to see what's happening

-- ========================================
-- STEP 1: Check current notification data
-- ========================================

-- Check all notifications for your user with chirp_id
SELECT 
    'Current notifications' as info,
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

-- ========================================
-- STEP 2: Check actual reactions to see what chirps were liked
-- ========================================

-- Check reactions (likes) by the actor user
SELECT 
    'Actual reactions by actor' as info,
    r.id as reaction_id,
    r.user_id as actor_id,
    r.chirp_id,
    r.created_at,
    c.content as chirp_content,
    c.author_id as chirp_author
FROM public.reactions r
LEFT JOIN public.chirps c ON r.chirp_id = c.id
WHERE r.user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
ORDER BY r.created_at DESC
LIMIT 10;

-- ========================================
-- STEP 3: Check comments/replies by the actor user
-- ========================================

-- Check comments by the actor user
SELECT 
    'Actual comments by actor' as info,
    c.id as comment_id,
    c.author_id as actor_id,
    c.reply_to_id as chirp_id,
    c.content as comment_content,
    c.created_at,
    parent.content as parent_chirp_content,
    parent.author_id as parent_chirp_author
FROM public.chirps c
LEFT JOIN public.chirps parent ON c.reply_to_id = parent.id
WHERE c.author_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND c.reply_to_id IS NOT NULL
ORDER BY c.created_at DESC
LIMIT 10;

-- ========================================
-- STEP 4: Find the correct chirp_id for notifications
-- ========================================

-- Find the most recent chirp that was liked by the actor
SELECT 
    'Most recent liked chirp' as info,
    r.chirp_id,
    c.content,
    c.author_id,
    r.created_at
FROM public.reactions r
LEFT JOIN public.chirps c ON r.chirp_id = c.id
WHERE r.user_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND c.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY r.created_at DESC
LIMIT 5;

-- Find the most recent chirp that was commented on by the actor
SELECT 
    'Most recent commented chirp' as info,
    c.reply_to_id as chirp_id,
    parent.content,
    parent.author_id,
    c.created_at
FROM public.chirps c
LEFT JOIN public.chirps parent ON c.reply_to_id = parent.id
WHERE c.author_id = '3497fbed-eeb5-4210-8f4a-b7bd6793846f'
AND parent.author_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'
ORDER BY c.created_at DESC
LIMIT 5;
