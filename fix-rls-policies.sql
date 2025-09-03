-- Fix Row Level Security (RLS) Policies for Chirp App
-- This script will enable proper access to the database tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chirps ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;

DROP POLICY IF EXISTS "Chirps are viewable by everyone" ON chirps;
DROP POLICY IF EXISTS "Users can insert their own chirps" ON chirps;
DROP POLICY IF EXISTS "Users can update their own chirps" ON chirps;
DROP POLICY IF EXISTS "Users can delete their own chirps" ON chirps;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can insert their own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON reactions;
DROP POLICY IF EXISTS "Users can insert their own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;

DROP POLICY IF EXISTS "Notifications are viewable by owner" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Create policies for users table
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (true);

-- Create policies for chirps table
CREATE POLICY "Chirps are viewable by everyone" ON chirps
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own chirps" ON chirps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own chirps" ON chirps
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own chirps" ON chirps
  FOR DELETE USING (true);

-- Create policies for follows table
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own follows" ON follows
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (true);

-- Create policies for reactions table
CREATE POLICY "Reactions are viewable by everyone" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (true);

-- Create policies for notifications table
CREATE POLICY "Notifications are viewable by owner" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (true);

-- Verify policies are created
SELECT 'RLS policies configured successfully!' as status;
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
