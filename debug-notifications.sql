-- Check notifications data and create test notifications
-- Run this in Supabase SQL Editor to debug your notifications

-- ========================================
-- STEP 1: Check if notifications table exists and has data
-- ========================================
SELECT 
    'Notifications Table Check' as status,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications
FROM public.notifications;

-- ========================================
-- STEP 2: Check all users and their data
-- ========================================
-- Show all users with their chirp counts
SELECT 
    'Users and Their Chirps' as status,
    u.id as user_id,
    u.email,
    u.custom_handle,
    u.handle,
    u.first_name,
    u.last_name,
    COUNT(c.id) as chirp_count,
    COUNT(r.id) as likes_received,
    COUNT(replies.id) as replies_received
FROM public.users u
LEFT JOIN public.chirps c ON u.id = c.author_id AND c.reply_to_id IS NULL
LEFT JOIN public.reactions r ON c.id = r.chirp_id
LEFT JOIN public.chirps replies ON c.id = replies.reply_to_id
GROUP BY u.id, u.email, u.custom_handle, u.handle, u.first_name, u.last_name
ORDER BY chirp_count DESC, likes_received DESC;

-- ========================================
-- STEP 3: Check all chirps with interaction counts
-- ========================================
SELECT 
    'All Chirps with Interactions' as status,
    c.id as chirp_id,
    c.content,
    c.author_id,
    u.custom_handle as author_handle,
    c.created_at,
    COUNT(r.id) as like_count,
    COUNT(replies.id) as reply_count
FROM public.chirps c
LEFT JOIN public.users u ON c.author_id = u.id
LEFT JOIN public.reactions r ON c.id = r.chirp_id
LEFT JOIN public.chirps replies ON c.id = replies.reply_to_id
WHERE c.reply_to_id IS NULL  -- Only main chirps, not replies
GROUP BY c.id, c.content, c.author_id, u.custom_handle, c.created_at
ORDER BY c.created_at DESC
LIMIT 20;

-- ========================================
-- STEP 4: Check all reactions (likes)
-- ========================================
SELECT 
    'All Reactions (Likes)' as status,
    r.id as reaction_id,
    r.user_id as liker_id,
    liker.custom_handle as liker_handle,
    r.chirp_id,
    c.content as chirp_content,
    author.custom_handle as chirp_author_handle,
    r.created_at as like_date
FROM public.reactions r
JOIN public.chirps c ON r.chirp_id = c.id
LEFT JOIN public.users liker ON r.user_id = liker.id
LEFT JOIN public.users author ON c.author_id = author.id
ORDER BY r.created_at DESC
LIMIT 20;

-- ========================================
-- STEP 5: Check all replies
-- ========================================
SELECT 
    'All Replies' as status,
    reply.id as reply_id,
    reply.content as reply_content,
    reply.author_id as replier_id,
    replier.custom_handle as replier_handle,
    reply.reply_to_id as original_chirp_id,
    original.content as original_content,
    original_author.custom_handle as original_author_handle,
    reply.created_at as reply_date
FROM public.chirps reply
JOIN public.chirps original ON reply.reply_to_id = original.id
LEFT JOIN public.users replier ON reply.author_id = replier.id
LEFT JOIN public.users original_author ON original.author_id = original_author.id
ORDER BY reply.created_at DESC
LIMIT 20;

-- ========================================
-- STEP 6: Check existing notifications
-- ========================================
SELECT 
    'Existing Notifications' as status,
    n.id,
    n.user_id,
    n.from_user_id,
    n.type,
    n.chirp_id,
    n.read,
    n.created_at,
    actor.custom_handle as actor_handle,
    recipient.custom_handle as recipient_handle
FROM public.notifications n
LEFT JOIN public.users actor ON n.from_user_id = actor.id
LEFT JOIN public.users recipient ON n.user_id = recipient.id
ORDER BY n.created_at DESC;

-- ========================================
-- STEP 7: Create test notifications for all users with chirps
-- ========================================
-- This will create test notifications for users who have chirps but no notifications
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
)
SELECT DISTINCT
    c.author_id as user_id,
    (SELECT id FROM public.users WHERE id != c.author_id LIMIT 1) as from_user_id,
    'like' as type,
    c.id as chirp_id,
    false as read,
    NOW() as created_at
FROM public.chirps c
WHERE c.reply_to_id IS NULL  -- Only main chirps
AND c.author_id NOT IN (
    SELECT DISTINCT user_id FROM public.notifications
)
LIMIT 5;  -- Limit to 5 test notifications

-- ========================================
-- STEP 8: Verify test notifications were created
-- ========================================
SELECT 
    'Test Notifications Created' as status,
    COUNT(*) as new_notifications_created
FROM public.notifications
WHERE created_at > NOW() - INTERVAL '1 minute';

-- ========================================
-- STEP 9: Show final notification summary
-- ========================================
SELECT 
    'Final Notification Summary' as status,
    recipient.custom_handle as recipient,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications,
    COUNT(*) FILTER (WHERE type = 'like') as like_notifications,
    COUNT(*) FILTER (WHERE type = 'comment') as comment_notifications,
    COUNT(*) FILTER (WHERE type = 'follow') as follow_notifications
FROM public.notifications n
LEFT JOIN public.users recipient ON n.user_id = recipient.id
GROUP BY recipient.custom_handle, recipient.id
ORDER BY total_notifications DESC;

-- ========================================
-- STEP 10: Check notification settings
-- ========================================
SELECT 
    'Notification Settings' as status,
    ns.user_id,
    u.custom_handle,
    ns.likes_enabled,
    ns.comments_enabled,
    ns.follows_enabled,
    ns.mentions_enabled
FROM public.notification_settings ns
LEFT JOIN public.users u ON ns.user_id = u.id;
