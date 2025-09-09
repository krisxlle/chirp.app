-- Create user_collections table for gacha system
-- This table stores which profiles users have collected through gacha

CREATE TABLE IF NOT EXISTS user_collections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common')),
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't collect the same profile twice
  UNIQUE(user_id, collected_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_collected_user_id ON user_collections(collected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_rarity ON user_collections(rarity);
CREATE INDEX IF NOT EXISTS idx_user_collections_obtained_at ON user_collections(obtained_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- Since we're using custom auth, we'll allow all authenticated requests
CREATE POLICY "Allow all operations for authenticated users" ON user_collections
  FOR ALL USING (true);

-- Alternative: If you want to disable RLS entirely for now
-- ALTER TABLE user_collections DISABLE ROW LEVEL SECURITY;
