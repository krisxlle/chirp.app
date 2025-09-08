-- Remove emoji reactions functionality
-- This script removes the emoji column from reactions table and simplifies reactions to just likes

-- ========================================
-- PART 1: Remove emoji column from reactions table
-- ========================================

-- First, check current reactions table structure
SELECT 
    'Current reactions structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;

-- Drop the emoji column
ALTER TABLE public.reactions DROP COLUMN IF EXISTS emoji;

-- ========================================
-- PART 2: Update reactions table to be simpler (just likes)
-- ========================================

-- Check if we need to add any missing columns for simple likes
DO $$ 
BEGIN
    -- Add type column if it doesn't exist (for future extensibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reactions' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.reactions ADD COLUMN type VARCHAR(20) DEFAULT 'like';
        RAISE NOTICE 'Added type column to reactions table';
    ELSE
        RAISE NOTICE 'Type column already exists in reactions table';
    END IF;
END $$;

-- ========================================
-- PART 3: Update RLS policies for simplified reactions
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "reactions_select_all" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert_auth" ON public.reactions;
DROP POLICY IF EXISTS "reactions_update_own" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete_own" ON public.reactions;
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- Create simple RLS policies for likes-only reactions
-- Policy 1: Everyone can view reactions (for displaying like counts)
CREATE POLICY "reactions_select_all" ON public.reactions
    FOR SELECT USING (true);

-- Policy 2: Authenticated users can insert reactions (likes)
CREATE POLICY "reactions_insert_auth" ON public.reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Users can delete their own reactions (unlike)
CREATE POLICY "reactions_delete_own" ON public.reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- PART 4: Create indexes for performance
-- ========================================

-- Drop old indexes that might reference emoji column
DROP INDEX IF EXISTS idx_reactions_emoji;

-- Create/update indexes for simplified reactions
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_chirp_id ON public.reactions(chirp_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(type);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON public.reactions(created_at);

-- ========================================
-- PART 5: Grant permissions
-- ========================================

-- Grant permissions for reactions table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.reactions TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.reactions TO anon;

-- ========================================
-- PART 6: Verification
-- ========================================

-- Verify reactions table structure after changes
SELECT 
    'Final reactions structure' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;

-- Verify RLS status
SELECT 
    'RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reactions';

-- Verify policies
SELECT 
    'Active Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'reactions'
ORDER BY policyname;

-- Success message
SELECT 'Emoji reactions removed successfully!' as status, 
       'Reactions table now supports simple likes only' as message;
