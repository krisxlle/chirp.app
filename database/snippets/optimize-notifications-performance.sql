-- Optimize notifications table for better performance
-- This script ensures proper indexes exist to prevent timeout errors

-- Check if notifications table exists and has the right structure
DO $$
BEGIN
    -- Create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'repost')),
            chirp_id UUID REFERENCES public.chirps(id) ON DELETE CASCADE,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created notifications table';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'from_user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.notifications ADD COLUMN from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added from_user_id column to notifications table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read' AND table_schema = 'public') THEN
        ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added read column to notifications table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.notifications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to notifications table';
    END IF;
END $$;

-- Create optimized indexes for notifications table
-- These indexes are crucial for preventing timeout errors

-- Primary query index: user_id + created_at (for main notification feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

-- Secondary indexes for different query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id 
ON public.notifications(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_from_user_id 
ON public.notifications(from_user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type 
ON public.notifications(type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_chirp_id 
ON public.notifications(chirp_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read 
ON public.notifications(read);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at 
ON public.notifications(created_at DESC);

-- Composite index for unread notifications query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications(user_id, read, created_at DESC) 
WHERE read = FALSE;

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
    
    -- Create new policies
    CREATE POLICY "Users can view own notifications" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert notifications for others" ON public.notifications
        FOR INSERT WITH CHECK (auth.uid() = from_user_id);
    
    CREATE POLICY "Users can update own notifications" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own notifications" ON public.notifications
        FOR DELETE USING (auth.uid() = user_id);
        
    RAISE NOTICE 'Created RLS policies for notifications table';
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.notifications TO anon;

-- Analyze the table to update statistics
ANALYZE public.notifications;

-- Show final table structure
SELECT 
    'Final notifications table structure' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    'Indexes on notifications table' as status,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications' 
AND schemaname = 'public'
ORDER BY indexname;
