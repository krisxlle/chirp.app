-- Fix Unused Index warnings
-- This script removes unused indexes to improve performance and reduce storage

-- Note: Before removing indexes, consider if they might be needed for future queries
-- This script removes indexes that have never been used according to the linter

-- 1. Remove unused indexes from chirps table
DROP INDEX IF EXISTS public.idx_chirps_author_id;
DROP INDEX IF EXISTS public.idx_chirps_created_at;
DROP INDEX IF EXISTS public.idx_chirps_has_image;
DROP INDEX IF EXISTS public.idx_chirps_reply_to_id;
DROP INDEX IF EXISTS public.idx_chirps_repost_of_id;
DROP INDEX IF EXISTS public.idx_chirps_thread_id;

-- 2. Remove unused indexes from reactions table
DROP INDEX IF EXISTS public.idx_reactions_chirp_id;
DROP INDEX IF EXISTS public.idx_reactions_created_at;
DROP INDEX IF EXISTS public.idx_reactions_type;
DROP INDEX IF EXISTS public.idx_reactions_user_id;

-- 3. Remove unused indexes from relationships table
DROP INDEX IF EXISTS public.idx_relationships_created_at;
DROP INDEX IF EXISTS public.idx_relationships_follower;
DROP INDEX IF EXISTS public.idx_relationships_following;

-- 4. Remove unused indexes from reposts table
DROP INDEX IF EXISTS public.idx_reposts_chirp_id;
DROP INDEX IF EXISTS public.idx_reposts_created_at;
DROP INDEX IF EXISTS public.idx_reposts_user_id;

-- 5. Remove unused indexes from user_collections table
DROP INDEX IF EXISTS public.idx_user_collections_collected_user_id;
DROP INDEX IF EXISTS public.idx_user_collections_obtained_at;
DROP INDEX IF EXISTS public.idx_user_collections_quantity;
DROP INDEX IF EXISTS public.idx_user_collections_rarity;
DROP INDEX IF EXISTS public.idx_user_collections_user_collected;
DROP INDEX IF EXISTS public.idx_user_collections_user_id;

-- 6. Remove unused indexes from waitlist table
DROP INDEX IF EXISTS public.idx_waitlist_created_at;
DROP INDEX IF EXISTS public.idx_waitlist_email;
DROP INDEX IF EXISTS public.idx_waitlist_verified;

-- 7. Remove unused indexes from follows table
DROP INDEX IF EXISTS public.idx_follows_follower_id;
DROP INDEX IF EXISTS public.idx_follows_following_id;

-- 8. Remove unused indexes from notifications table
DROP INDEX IF EXISTS public.idx_notifications_chirp_id;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_notifications_from_user_id;
DROP INDEX IF EXISTS public.idx_notifications_read;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_user_id;

-- 9. Remove unused indexes from profile_frames table
DROP INDEX IF EXISTS public.idx_profile_frames_available;
DROP INDEX IF EXISTS public.idx_profile_frames_rarity;
DROP INDEX IF EXISTS public.idx_profile_frames_season;

-- 10. Remove unused indexes from seasons table
-- Note: unique_active_season is a constraint, not a regular index - keeping it for data integrity
-- DROP INDEX IF EXISTS public.unique_active_season; -- This is a constraint, not an index
DROP INDEX IF EXISTS public.idx_seasons_active;
DROP INDEX IF EXISTS public.idx_seasons_dates;

-- 11. Remove unused indexes from user_frame_collections table
DROP INDEX IF EXISTS public.idx_user_frame_collections_frame;
DROP INDEX IF EXISTS public.idx_user_frame_collections_obtained;
DROP INDEX IF EXISTS public.idx_user_frame_collections_user;

-- 12. Remove unused indexes from users table
DROP INDEX IF EXISTS public.idx_users_id;

-- Verify indexes have been removed
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_chirps_author_id', 'idx_chirps_created_at', 'idx_chirps_has_image',
        'idx_chirps_reply_to_id', 'idx_chirps_repost_of_id', 'idx_chirps_thread_id',
        'idx_reactions_chirp_id', 'idx_reactions_created_at', 'idx_reactions_type',
        'idx_reactions_user_id', 'idx_relationships_created_at', 'idx_relationships_follower',
        'idx_relationships_following', 'idx_reposts_chirp_id', 'idx_reposts_created_at',
        'idx_reposts_user_id', 'idx_user_collections_collected_user_id', 'idx_user_collections_obtained_at',
        'idx_user_collections_quantity', 'idx_user_collections_rarity', 'idx_user_collections_user_collected',
        'idx_user_collections_user_id', 'idx_waitlist_created_at', 'idx_waitlist_email',
        'idx_waitlist_verified', 'idx_follows_follower_id', 'idx_follows_following_id',
        'idx_notifications_chirp_id', 'idx_notifications_created_at', 'idx_notifications_from_user_id',
        'idx_notifications_read', 'idx_notifications_type', 'idx_notifications_user_id',
        'idx_profile_frames_available', 'idx_profile_frames_rarity', 'idx_profile_frames_season',
        'idx_seasons_active', 'idx_seasons_dates',
        'idx_user_frame_collections_frame', 'idx_user_frame_collections_obtained',
        'idx_user_frame_collections_user', 'idx_users_id'
    );

-- Show remaining indexes for verification
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN (
        'chirps', 'reactions', 'relationships', 'reposts', 'user_collections',
        'waitlist', 'follows', 'notifications', 'profile_frames', 'seasons',
        'user_frame_collections', 'users'
    )
ORDER BY tablename, indexname;

-- Success message
SELECT 'Unused index warnings fixed!' as status;
