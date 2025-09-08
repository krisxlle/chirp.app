-- Create reposts table for Chirp app
-- This table tracks when users repost (retweet) other users' chirps

CREATE TABLE IF NOT EXISTS public.reposts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chirp_id INTEGER NOT NULL REFERENCES public.chirps(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only repost a chirp once
    UNIQUE(user_id, chirp_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_chirp_id ON public.reposts(chirp_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON public.reposts(created_at);

-- Add RLS policies for reposts table
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reposts
CREATE POLICY "Users can view all reposts" ON public.reposts
    FOR SELECT USING (true);

-- Policy: Users can create their own reposts
CREATE POLICY "Users can create their own reposts" ON public.reposts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reposts
CREATE POLICY "Users can delete their own reposts" ON public.reposts
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reposts_updated_at BEFORE UPDATE ON public.reposts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample reposts for testing (optional)
-- INSERT INTO public.reposts (user_id, chirp_id) VALUES 
--     ('123e4567-e89b-12d3-a456-426614174000', 1),
--     ('123e4567-e89b-12d3-a456-426614174000', 2);

COMMENT ON TABLE public.reposts IS 'Tracks when users repost (retweet) other users chirps';
COMMENT ON COLUMN public.reposts.user_id IS 'The user who reposted the chirp';
COMMENT ON COLUMN public.reposts.chirp_id IS 'The chirp that was reposted';
