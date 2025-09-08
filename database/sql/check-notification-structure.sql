-- Quick check of notification table structure
-- Run this in Supabase SQL Editor to see the actual field types

SELECT 
    'Notification Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check a sample notification
SELECT 
    'Sample Notification' as info,
    id,
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
FROM public.notifications
LIMIT 1;
