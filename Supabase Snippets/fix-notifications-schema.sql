-- Fix notifications table schema
-- Run this in your Supabase SQL Editor

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public';

-- Add missing actor_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'actor_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added actor_id column to notifications table';
    ELSE
        RAISE NOTICE 'actor_id column already exists';
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$ 
BEGIN
    -- Add type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN type VARCHAR(20) CHECK (type IN ('like', 'comment', 'follow', 'mention'));
        
        RAISE NOTICE 'Added type column to notifications table';
    END IF;
    
    -- Add chirp_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'chirp_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN chirp_id UUID REFERENCES public.chirps(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added chirp_id column to notifications table';
    END IF;
    
    -- Add comment_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'comment_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN comment_id UUID REFERENCES public.chirps(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added comment_id column to notifications table';
    END IF;
    
    -- Add is_read column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'is_read'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added is_read column to notifications table';
    END IF;
    
    -- Add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added created_at column to notifications table';
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to notifications table';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_chirp_id ON public.notifications(chirp_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Verify the final structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
