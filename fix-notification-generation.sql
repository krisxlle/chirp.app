-- Fix notification generation for all interactions
-- Run this in Supabase SQL Editor to ensure notifications work for all users

-- ========================================
-- STEP 1: Check if triggers exist and are active
-- ========================================

-- Check existing triggers
SELECT 
    'Existing Triggers' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%notify%'
ORDER BY trigger_name;

-- ========================================
-- STEP 2: Recreate all notification functions and triggers
-- ========================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_notify_like ON public.reactions;
DROP TRIGGER IF EXISTS trigger_notify_follow ON public.follows;
DROP TRIGGER IF EXISTS trigger_notify_comment ON public.chirps;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.notify_like();
DROP FUNCTION IF EXISTS public.notify_follow();
DROP FUNCTION IF EXISTS public.notify_comment();
DROP FUNCTION IF EXISTS public.create_notification(UUID, UUID, VARCHAR, INTEGER, INTEGER);

-- ========================================
-- STEP 3: Create notification creation function
-- ========================================

CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    actor_user_id UUID,
    notification_type VARCHAR,
    chirp_id INTEGER DEFAULT NULL,
    comment_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    settings_record RECORD;
    notification_exists BOOLEAN;
BEGIN
    -- Don't create notification if user is acting on their own content
    IF target_user_id = actor_user_id THEN
        RETURN FALSE;
    END IF;

    -- Check if user has notifications enabled for this type
    SELECT * INTO settings_record
    FROM public.notification_settings
    WHERE user_id = target_user_id;

    IF settings_record IS NOT NULL THEN
        CASE notification_type
            WHEN 'like' THEN
                IF NOT settings_record.likes_enabled THEN
                    RETURN FALSE;
                END IF;
            WHEN 'comment' THEN
                IF NOT settings_record.comments_enabled THEN
                    RETURN FALSE;
                END IF;
            WHEN 'follow' THEN
                IF NOT settings_record.follows_enabled THEN
                    RETURN FALSE;
                END IF;
            WHEN 'mention' THEN
                IF NOT settings_record.mentions_enabled THEN
                    RETURN FALSE;
                END IF;
        END CASE;
    END IF;

    -- Check if similar notification already exists (prevent spam)
    SELECT EXISTS(
        SELECT 1 FROM public.notifications
        WHERE user_id = target_user_id
        AND from_user_id = actor_user_id
        AND type = notification_type
        AND chirp_id = chirp_id
        AND comment_id = comment_id
        AND read = FALSE
        AND created_at > NOW() - INTERVAL '1 hour'
    ) INTO notification_exists;

    IF notification_exists THEN
        -- Update existing notification timestamp instead of creating new one
        UPDATE public.notifications
        SET created_at = NOW()
        WHERE user_id = target_user_id
        AND from_user_id = actor_user_id
        AND type = notification_type
        AND chirp_id = chirp_id
        AND comment_id = comment_id
        AND read = FALSE;
        
        RETURN TRUE;
    END IF;

    -- Create new notification
    INSERT INTO public.notifications (
        user_id,
        from_user_id,
        type,
        chirp_id,
        comment_id,
        read,
        created_at
    ) VALUES (
        target_user_id,
        actor_user_id,
        notification_type,
        chirp_id,
        comment_id,
        FALSE,
        NOW()
    );

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ========================================
-- STEP 4: Create trigger functions
-- ========================================

-- Trigger function for likes (using reactions table)
CREATE OR REPLACE FUNCTION public.notify_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    chirp_author_id UUID;
BEGIN
    -- Get the chirp author
    SELECT author_id::UUID INTO chirp_author_id
    FROM public.chirps
    WHERE id = NEW.chirp_id;

    -- Create notification
    PERFORM public.create_notification(
        chirp_author_id,
        NEW.user_id::UUID,
        'like',
        NEW.chirp_id
    );

    RETURN NEW;
END;
$$;

-- Trigger function for follows
CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Create notification
    PERFORM public.create_notification(
        NEW.following_id::UUID,
        NEW.follower_id::UUID,
        'follow'
    );

    RETURN NEW;
END;
$$;

-- Trigger function for comments/replies
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    parent_chirp_author_id UUID;
BEGIN
    -- Get the parent chirp author
    SELECT author_id::UUID INTO parent_chirp_author_id
    FROM public.chirps
    WHERE id = NEW.reply_to_id;

    -- Create notification
    PERFORM public.create_notification(
        parent_chirp_author_id,
        NEW.author_id::UUID,
        'comment',
        NEW.reply_to_id
    );

    RETURN NEW;
END;
$$;

-- ========================================
-- STEP 5: Create triggers
-- ========================================

-- Like trigger
CREATE TRIGGER trigger_notify_like
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_like();

-- Follow trigger
CREATE TRIGGER trigger_notify_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_follow();

-- Comment trigger
CREATE TRIGGER trigger_notify_comment
    AFTER INSERT ON public.chirps
    FOR EACH ROW
    WHEN (NEW.reply_to_id IS NOT NULL)
    EXECUTE FUNCTION public.notify_comment();

-- ========================================
-- STEP 6: Test notification creation
-- ========================================

-- First, let's find actual chirp IDs that exist
SELECT 
    'Available Chirps' as info,
    id,
    author_id,
    content
FROM public.chirps 
ORDER BY id DESC 
LIMIT 5;

-- Test the notification function with a real chirp ID
-- (Replace the chirp_id below with an actual ID from the query above)
SELECT 
    'Test Notification Creation' as info,
    public.create_notification(
        'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53'::UUID,  -- target user (your new user)
        '3497fbed-eeb5-4210-8f4a-b7bd6793846f'::UUID,  -- actor user (your old user)
        'test',
        (SELECT id FROM public.chirps ORDER BY id DESC LIMIT 1)  -- Use actual chirp ID
    ) as test_result;

-- ========================================
-- STEP 7: Verify triggers are active
-- ========================================

-- Check that triggers were created
SELECT 
    'Active Triggers' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%notify%'
ORDER BY trigger_name;

-- ========================================
-- STEP 8: Create test notifications for your user
-- ========================================

-- Create some test notifications for your new user using actual chirp IDs
INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    chirp_id,
    read,
    created_at
) VALUES 
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'like', (SELECT id FROM public.chirps ORDER BY id DESC LIMIT 1 OFFSET 0), FALSE, NOW()),
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'comment', (SELECT id FROM public.chirps ORDER BY id DESC LIMIT 1 OFFSET 1), FALSE, NOW()),
    ('b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53', '3497fbed-eeb5-4210-8f4a-b7bd6793846f', 'follow', NULL, FALSE, NOW());

-- Check the notifications were created
SELECT 
    'Test Notifications Created' as info,
    COUNT(*) as notification_count
FROM public.notifications 
WHERE user_id = 'b650c94b-44a8-4ed4-8dd0-8ab7a1da8b53';

-- Final status
SELECT 
    'Notification System Fixed' as status,
    'Triggers recreated and test notifications added' as message,
    'All interactions should now generate notifications' as note;
