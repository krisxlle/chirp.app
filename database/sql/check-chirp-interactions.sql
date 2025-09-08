-- Check all interactions on your chirps (all time)
-- Replace 'YOUR_USER_ID' with your actual user ID

-- 1. Get all your chirps with interaction counts
SELECT 
    c.id as chirp_id,
    c.content,
    c.created_at as chirp_created,
    COUNT(DISTINCT r.id) as total_likes,
    COUNT(DISTINCT replies.id) as total_replies,
    COUNT(DISTINCT reposts.id) as total_reposts
FROM chirps c
LEFT JOIN reactions r ON c.id = r.chirp_id
LEFT JOIN chirps replies ON c.id = replies.reply_to_id
LEFT JOIN reposts ON c.id = reposts.chirp_id
WHERE c.author_id = 'YOUR_USER_ID'
GROUP BY c.id, c.content, c.created_at
ORDER BY c.created_at DESC;

-- 2. Get all likes on your chirps with user details
SELECT 
    c.id as chirp_id,
    c.content as chirp_content,
    c.created_at as chirp_created,
    r.created_at as like_created,
    u.first_name,
    u.last_name,
    u.custom_handle,
    u.handle,
    u.email
FROM chirps c
JOIN reactions r ON c.id = r.chirp_id
JOIN users u ON r.user_id = u.id
WHERE c.author_id = 'YOUR_USER_ID'
ORDER BY r.created_at DESC;

-- 3. Get all replies to your chirps with user details
SELECT 
    c.id as original_chirp_id,
    c.content as original_content,
    c.created_at as original_created,
    replies.id as reply_id,
    replies.content as reply_content,
    replies.created_at as reply_created,
    u.first_name,
    u.last_name,
    u.custom_handle,
    u.handle,
    u.email
FROM chirps c
JOIN chirps replies ON c.id = replies.reply_to_id
JOIN users u ON replies.author_id = u.id
WHERE c.author_id = 'YOUR_USER_ID'
ORDER BY replies.created_at DESC;

-- 4. Get all reposts of your chirps with user details
SELECT 
    c.id as original_chirp_id,
    c.content as original_content,
    c.created_at as original_created,
    reposts.created_at as repost_created,
    u.first_name,
    u.last_name,
    u.custom_handle,
    u.handle,
    u.email
FROM chirps c
JOIN reposts ON c.id = reposts.chirp_id
JOIN users u ON reposts.user_id = u.id
WHERE c.author_id = 'YOUR_USER_ID'
ORDER BY reposts.created_at DESC;

-- 5. Get all notifications related to your chirps
SELECT 
    n.id as notification_id,
    n.type,
    n.created_at as notification_created,
    n.read,
    c.id as chirp_id,
    c.content as chirp_content,
    actor.first_name as actor_first_name,
    actor.last_name as actor_last_name,
    actor.custom_handle as actor_handle,
    actor.handle as actor_username
FROM notifications n
JOIN chirps c ON n.chirp_id = c.id
LEFT JOIN users actor ON n.from_user_id = actor.id
WHERE c.author_id = 'YOUR_USER_ID'
ORDER BY n.created_at DESC;

-- 6. Summary statistics for your chirps
SELECT 
    COUNT(DISTINCT c.id) as total_chirps,
    COUNT(DISTINCT r.id) as total_likes_received,
    COUNT(DISTINCT replies.id) as total_replies_received,
    COUNT(DISTINCT reposts.id) as total_reposts_received,
    COUNT(DISTINCT n.id) as total_notifications,
    COUNT(DISTINCT CASE WHEN n.read = false THEN n.id END) as unread_notifications
FROM chirps c
LEFT JOIN reactions r ON c.id = r.chirp_id
LEFT JOIN chirps replies ON c.id = replies.reply_to_id
LEFT JOIN reposts ON c.id = reposts.chirp_id
LEFT JOIN notifications n ON c.id = n.chirp_id
WHERE c.author_id = 'YOUR_USER_ID';
