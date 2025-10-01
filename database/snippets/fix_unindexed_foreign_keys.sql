-- Fix Unindexed Foreign Keys warnings
-- This script adds covering indexes for foreign key constraints to improve performance

-- 1. Fix feedback table - user_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- 2. Fix invitations table - inviter_id foreign key
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON public.invitations(inviter_id);

-- 3. Fix link_shares table - shared_by foreign key
CREATE INDEX IF NOT EXISTS idx_link_shares_shared_by ON public.link_shares(shared_by);

-- 4. Fix link_shares table - user_id foreign key
CREATE INDEX IF NOT EXISTS idx_link_shares_user_id ON public.link_shares(user_id);

-- 5. Fix user_blocks table - blocked_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON public.user_blocks(blocked_id);

-- 6. Fix user_equipped_frames table - frame_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_equipped_frames_frame_id ON public.user_equipped_frames(frame_id);

-- 7. Fix user_notification_settings table - followed_user_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_followed_user_id ON public.user_notification_settings(followed_user_id);

-- 8. Fix vip_codes table - used_by foreign key
CREATE INDEX IF NOT EXISTS idx_vip_codes_used_by ON public.vip_codes(used_by);

-- Verify the indexes have been created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_feedback_user_id',
        'idx_invitations_inviter_id',
        'idx_link_shares_shared_by',
        'idx_link_shares_user_id',
        'idx_user_blocks_blocked_id',
        'idx_user_equipped_frames_frame_id',
        'idx_user_notification_settings_followed_user_id',
        'idx_vip_codes_used_by'
    )
ORDER BY tablename, indexname;

-- Check foreign key constraints and their covering indexes
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    CASE 
        WHEN idx.indexname IS NOT NULL THEN '✅ Indexed'
        ELSE '❌ Not Indexed'
    END as index_status,
    idx.indexname
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN pg_indexes idx 
    ON tc.table_name = idx.tablename
    AND kcu.column_name = ANY(string_to_array(replace(replace(idx.indexdef, 'CREATE INDEX ', ''), ' ON public.', ' '), ' '))
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
        'feedback', 'invitations', 'link_shares', 'user_blocks', 
        'user_equipped_frames', 'user_notification_settings', 'vip_codes'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- Success message
SELECT 'Unindexed foreign key warnings fixed!' as status;
