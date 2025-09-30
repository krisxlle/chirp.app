-- Create profile frames gacha system
-- This replaces the user-to-user gacha with profile frame collection

-- Create seasons table for organizing frames by time periods
CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one active season at a time
  CONSTRAINT unique_active_season EXCLUDE (is_active WITH =) WHERE (is_active = true)
);

-- Create profile_frames table for frame definitions
CREATE TABLE IF NOT EXISTS profile_frames (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common')),
  season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  preview_url VARCHAR(500), -- Optional preview image
  drop_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- Drop rate as decimal (0.0001 = 0.01%)
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique frame names per season
  UNIQUE(name, season_id)
);

-- Create user_frame_collections table (replaces user_collections)
CREATE TABLE IF NOT EXISTS user_frame_collections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frame_id INTEGER NOT NULL REFERENCES profile_frames(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Allow multiple copies of the same frame
  UNIQUE(user_id, frame_id)
);

-- Create user_equipped_frames table for tracking equipped frames
CREATE TABLE IF NOT EXISTS user_equipped_frames (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frame_id INTEGER NOT NULL REFERENCES profile_frames(id) ON DELETE CASCADE,
  equipped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One equipped frame per user
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active);
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_profile_frames_season ON profile_frames(season_id);
CREATE INDEX IF NOT EXISTS idx_profile_frames_rarity ON profile_frames(rarity);
CREATE INDEX IF NOT EXISTS idx_profile_frames_available ON profile_frames(is_available);
CREATE INDEX IF NOT EXISTS idx_user_frame_collections_user ON user_frame_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_frame_collections_frame ON user_frame_collections(frame_id);
CREATE INDEX IF NOT EXISTS idx_user_frame_collections_obtained ON user_frame_collections(obtained_at);
CREATE INDEX IF NOT EXISTS idx_user_equipped_frames_user ON user_equipped_frames(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_frame_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipped_frames ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON seasons FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON profile_frames FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON user_frame_collections FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON user_equipped_frames FOR ALL USING (true);

-- Insert default season (Season 1)
INSERT INTO seasons (name, description, start_date, end_date, is_active) VALUES 
('Season 1', 'The inaugural season featuring classic profile frames', NOW(), NOW() + INTERVAL '1 month', true)
ON CONFLICT DO NOTHING;

-- Insert default profile frames for Season 1 using actual assets
INSERT INTO profile_frames (name, description, rarity, season_id, image_url, drop_rate) VALUES 
-- Common frames (70% total)
('Simple Gray Frame', 'A simple and elegant gray frame for everyday use', 'common', 1, '/assets/Season 1/Simple Gray Frame Common.png', 0.4000),
('Purple Heart Frame', 'A charming purple heart frame with romantic vibes', 'common', 1, '/assets/Season 1/Purple Heart Frame Common.png', 0.3000),

-- Uncommon frames (20% total)
('Green Mushroom Frame', 'A whimsical green mushroom frame from the forest', 'uncommon', 1, '/assets/Season 1/Green Mushroom Frame Uncommon.png', 0.1000),
('Yellow Star Frame', 'A bright yellow star frame that shines with optimism', 'uncommon', 1, '/assets/Season 1/Yellow Star Frame Uncommon.png', 0.1000),

-- Rare frames (8% total)
('Pink Fairy Frame', 'A magical pink fairy frame with enchanting sparkles', 'rare', 1, '/assets/Season 1/Pink Fairy Frame Rare.png', 0.0400),
('Blue Butterfly Frame', 'A delicate blue butterfly frame with graceful wings', 'rare', 1, '/assets/Season 1/Blue Butterfly Frame Rare.png', 0.0400),

-- Epic frames (1.5% total)
('Red Cat Frame', 'A fierce red cat frame with mysterious feline energy', 'epic', 1, '/assets/Season 1/Red Cat Frame Epic.png', 0.0150),

-- Legendary frames (0.4% total)
('Green Leaf Frame', 'A legendary green leaf frame representing nature''s power', 'legendary', 1, '/assets/Season 1/Green Leaf Frame Legendary.png', 0.0020),
('Red Heart Frame', 'A legendary red heart frame symbolizing eternal love', 'legendary', 1, '/assets/Season 1/Red Heart Frame Legendary.png', 0.0020),

-- Mythic frames (0.1% total)
('Purple Bird Frame', 'A mythical purple bird frame with divine avian grace', 'mythic', 1, '/assets/Season 1/Purple Bird Frame Mythic.png', 0.0010)
ON CONFLICT (name, season_id) DO NOTHING;
