-- Supabase Notifications Database Schema
-- This script creates the necessary tables for the notification system

-- ========================================
-- STEP 1: Create notifications table
-- ========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
    chirp_id UUID REFERENCES public.chirps(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.chirps(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: Create notification_settings table
-- ========================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    likes_enabled BOOLEAN DEFAULT TRUE,
    comments_enabled BOOLEAN DEFAULT TRUE,
    follows_enabled BOOLEAN DEFAULT TRUE,
    mentions_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: Enable RLS on all tables
-- ========================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: Create RLS policies
-- ========================================
-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for others" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification settings" ON public.notification_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- STEP 5: Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_chirp_id ON public.notifications(chirp_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- ========================================
-- STEP 6: Grant permissions
-- ========================================
-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_settings TO authenticated;

-- Grant read-only permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.notifications TO anon;
GRANT SELECT ON public.notification_settings TO anon;

-- ========================================
-- STEP 7: Create functions for notification management
-- ========================================
-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    actor_user_id UUID,
    notification_type VARCHAR(20),
    chirp_uuid UUID DEFAULT NULL,
    comment_uuid UUID DEFAULT NULL
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
        AND actor_id = actor_user_id
        AND type = notification_type
        AND chirp_id = chirp_uuid
        AND comment_id = comment_uuid
        AND is_read = FALSE
        AND created_at > NOW() - INTERVAL '1 hour'
    ) INTO notification_exists;

    IF notification_exists THEN
        -- Update existing notification timestamp instead of creating new one
        UPDATE public.notifications
        SET updated_at = NOW()
        WHERE user_id = target_user_id
        AND actor_id = actor_user_id
        AND type = notification_type
        AND chirp_id = chirp_uuid
        AND comment_id = comment_uuid
        AND is_read = FALSE;
        
        RETURN TRUE;
    END IF;

    -- Create new notification
    INSERT INTO public.notifications (
        user_id,
        actor_id,
        type,
        chirp_id,
        comment_id,
        is_read,
        created_at,
        updated_at
    ) VALUES (
        target_user_id,
        actor_user_id,
        notification_type,
        chirp_uuid,
        comment_uuid,
        FALSE,
        NOW(),
        NOW()
    );

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to get notification counts
CREATE OR REPLACE FUNCTION public.get_notification_counts(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE is_read = FALSE),
        'likes', COUNT(*) FILTER (WHERE type = 'like'),
        'comments', COUNT(*) FILTER (WHERE type = 'comment'),
        'follows', COUNT(*) FILTER (WHERE type = 'follow'),
        'mentions', COUNT(*) FILTER (WHERE type = 'mention')
    ) INTO result
    FROM public.notifications
    WHERE user_id = user_uuid;

    RETURN COALESCE(result, '{"total":0,"unread":0,"likes":0,"comments":0,"follows":0,"mentions":0}'::json);
END;
$$;

-- ========================================
-- STEP 8: Create triggers for automatic notifications
-- ========================================
-- Trigger function for likes
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
    SELECT author_id INTO chirp_author_id
    FROM public.chirps
    WHERE id = NEW.chirp_id;

    -- Create notification
    PERFORM public.create_notification(
        chirp_author_id,
        NEW.user_id,
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
        NEW.following_id,
        NEW.follower_id,
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
    SELECT author_id INTO parent_chirp_author_id
    FROM public.chirps
    WHERE id = NEW.reply_to_id;

    -- Create notification
    PERFORM public.create_notification(
        parent_chirp_author_id,
        NEW.author_id,
        'comment',
        NEW.reply_to_id
    );

    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_like ON public.likes;
CREATE TRIGGER trigger_notify_like
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_like();

DROP TRIGGER IF EXISTS trigger_notify_follow ON public.follows;
CREATE TRIGGER trigger_notify_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_follow();

DROP TRIGGER IF EXISTS trigger_notify_comment ON public.chirps;
CREATE TRIGGER trigger_notify_comment
    AFTER INSERT ON public.chirps
    FOR EACH ROW
    WHEN (NEW.reply_to_id IS NOT NULL)
    EXECUTE FUNCTION public.notify_comment();

-- ========================================
-- STEP 9: Add comments for documentation
-- ========================================
COMMENT ON TABLE public.notifications IS 'Stores all user notifications';
COMMENT ON TABLE public.notification_settings IS 'User notification preferences';

COMMENT ON FUNCTION public.create_notification IS 'Creates a notification with spam prevention';
COMMENT ON FUNCTION public.get_notification_counts IS 'Returns notification counts for a user';

COMMENT ON FUNCTION public.notify_like IS 'Trigger function to create like notifications';
COMMENT ON FUNCTION public.notify_follow IS 'Trigger function to create follow notifications';
COMMENT ON FUNCTION public.notify_comment IS 'Trigger function to create comment notifications';

-- Success message
SELECT 'Notifications Database Schema Setup Complete!' as status, 
       'All tables, triggers, and functions created successfully' as message;
