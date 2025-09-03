-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (matching your existing schema)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  avatar_url VARCHAR,
  banner_image_url VARCHAR,
  bio TEXT,
  link_in_bio VARCHAR,
  interests TEXT[],
  handle VARCHAR UNIQUE NOT NULL,
  custom_handle VARCHAR UNIQUE,
  has_custom_handle BOOLEAN DEFAULT false,
  link_shares INTEGER DEFAULT 0,
  vip_code_used BOOLEAN DEFAULT false,
  last_ai_generation_date TIMESTAMP WITH TIME ZONE,
  ai_generations_today INTEGER DEFAULT 0,
  agreed_to_terms BOOLEAN DEFAULT false,
  agreed_to_privacy BOOLEAN DEFAULT false,
  terms_agreed_at TIMESTAMP WITH TIME ZONE,
  privacy_agreed_at TIMESTAMP WITH TIME ZONE,
  weekly_analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chirps table (matching your existing schema)
CREATE TABLE IF NOT EXISTS chirps (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  is_weekly_summary BOOLEAN DEFAULT false,
  reply_to_id INTEGER REFERENCES chirps(id) ON DELETE CASCADE,
  repost_of_id INTEGER REFERENCES chirps(id) ON DELETE CASCADE,
  thread_id INTEGER REFERENCES chirps(id) ON DELETE CASCADE,
  thread_order INTEGER DEFAULT 0,
  is_thread_starter BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table (matching your existing schema)
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Reactions table (matching your existing schema)
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chirp_id INTEGER NOT NULL REFERENCES chirps(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chirp_id, user_id)
);

-- Notifications table (matching your existing schema)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chirp_id INTEGER REFERENCES chirps(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIP Codes table (matching your existing schema)
CREATE TABLE IF NOT EXISTS vip_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations table (matching your existing schema)
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR NOT NULL,
  invitee_handle VARCHAR,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Summaries table (matching your existing schema)
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  summary_content TEXT NOT NULL,
  chirp_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  follower_growth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- User Blocks table (matching your existing schema)
CREATE TABLE IF NOT EXISTS user_blocks (
  id SERIAL PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- User Notification Settings table (matching your existing schema)
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_on_post BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, followed_user_id)
);

-- Feedback table (matching your existing schema)
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Tokens table (matching your existing schema)
CREATE TABLE IF NOT EXISTS push_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Link Shares table (matching your existing schema)
CREATE TABLE IF NOT EXISTS link_shares (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chirps ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for public read access
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Chirps are viewable by everyone" ON chirps FOR SELECT USING (true);
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Reactions are viewable by everyone" ON reactions FOR SELECT USING (true);
CREATE POLICY "Notifications are viewable by owner" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "VIP codes are viewable by everyone" ON vip_codes FOR SELECT USING (true);
CREATE POLICY "Invitations are viewable by everyone" ON invitations FOR SELECT USING (true);
CREATE POLICY "Weekly summaries are viewable by everyone" ON weekly_summaries FOR SELECT USING (true);
CREATE POLICY "User blocks are viewable by everyone" ON user_blocks FOR SELECT USING (true);
CREATE POLICY "User notification settings are viewable by owner" ON user_notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Feedback is viewable by everyone" ON feedback FOR SELECT USING (true);
CREATE POLICY "Push tokens are viewable by owner" ON push_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Link shares are viewable by everyone" ON link_shares FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update/delete
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can create chirps" ON chirps FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own chirps" ON chirps FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own chirps" ON chirps FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Users can manage follows" ON follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can manage reactions" ON reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification settings" ON user_notification_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can submit feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage blocks" ON user_blocks FOR ALL USING (auth.uid() = blocker_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chirps_author_id ON chirps(author_id);
CREATE INDEX IF NOT EXISTS idx_chirps_created_at ON chirps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chirps_reply_to_id ON chirps(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chirps_repost_of_id ON chirps(repost_of_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_reactions_chirp_id ON reactions(chirp_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Insert sample data (optional)
-- Uncomment the lines below if you want to add sample data

/*
-- Sample users
INSERT INTO users (id, email, first_name, last_name, handle, custom_handle, bio) VALUES
('user_1', 'alice@example.com', 'Alice', 'Johnson', 'alicej', 'alicej', 'Coffee enthusiast and tech lover'),
('user_2', 'bob@example.com', 'Bob', 'Smith', 'bobsmith', 'bobsmith', 'Building amazing things'),
('user_3', 'charlie@example.com', 'Charlie', 'Brown', 'charlieb', 'charlieb', 'Adventure seeker');

-- Sample chirps
INSERT INTO chirps (content, author_id) VALUES
('Just had the most amazing coffee! ☕️ #coffee #morning', 'user_1'),
('Working on some exciting new features! 💻 #coding #development', 'user_2'),
('Beautiful sunset tonight! 🌅 #nature #photography', 'user_3'),
('Can''t believe how fast this week is flying by! ⏰ #time #life', 'user_1'),
('Great meeting with the team today! 👥 #teamwork #collaboration', 'user_2');
*/

-- Success message
SELECT 'Database setup completed successfully!' as status;
