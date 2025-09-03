-- Data Migration Script
-- This script helps you migrate data from your existing database to Supabase
-- Run this AFTER running the supabase-setup.sql script

-- Step 1: Insert your existing users
-- Replace the values below with your actual user data
INSERT INTO users (id, email, first_name, last_name, handle, custom_handle, bio, created_at) VALUES
-- Add your existing users here, for example:
('existing_user_1', 'your-email@example.com', 'Your', 'Name', 'yourhandle', 'yourhandle', 'Your bio', NOW()),
('existing_user_2', 'another-user@example.com', 'Another', 'User', 'anotheruser', 'anotheruser', 'Another user bio', NOW());

-- Step 2: Insert your existing chirps
-- Replace the values below with your actual chirp data
INSERT INTO chirps (content, author_id, created_at) VALUES
-- Add your existing chirps here, for example:
('Your first chirp content here', 'existing_user_1', NOW() - INTERVAL '1 day'),
('Your second chirp content here', 'existing_user_1', NOW() - INTERVAL '2 hours'),
('Another user chirp content', 'existing_user_2', NOW() - INTERVAL '30 minutes');

-- Step 3: Insert your existing follows (if any)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
-- Add your existing follows here, for example:
('existing_user_1', 'existing_user_2', NOW() - INTERVAL '1 day');

-- Step 4: Insert your existing reactions (if any)
INSERT INTO reactions (user_id, chirp_id, emoji, created_at) VALUES
-- Add your existing reactions here, for example:
('existing_user_2', 1, '❤️', NOW() - INTERVAL '1 hour');

-- Verify the migration
SELECT 'Migration completed!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_chirps FROM chirps;
SELECT COUNT(*) as total_follows FROM follows;
SELECT COUNT(*) as total_reactions FROM reactions;
