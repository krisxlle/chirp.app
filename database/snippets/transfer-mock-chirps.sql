-- Transfer Mock Chirps to Supabase
-- This script will insert the mock chirps from the app into your Supabase database

-- First, ensure we have the mock user (Kriselle) in the database
INSERT INTO users (id, email, first_name, last_name, handle, custom_handle, bio, created_at) 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'kriselle.t@icloud.com',
  'Kriselle',
  NULL,
  'iuh423775',
  'kriselle',
  'founder of @Chirp',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert the mock chirps from the app
INSERT INTO chirps (content, author_id, created_at) VALUES
('Just had the most amazing coffee! ☕️ #coffee #morning', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '10 hours'),
('Working on some exciting new features for the app! 💻 #coding #development', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '9 hours'),
('Beautiful sunset tonight! 🌅 #nature #photography', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '8 hours'),
('Can''t believe how fast this week is flying by! ⏰ #time #life', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '7 hours'),
('Great meeting with the team today! 👥 #teamwork #collaboration', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '6 hours'),
('Just finished reading an incredible book! 📚 #reading #books', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '5 hours'),
('Perfect weather for a walk in the park! 🌳 #outdoors #exercise', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '4 hours'),
('Excited about the upcoming project launch! 🚀 #excitement #launch', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '3 hours'),
('Love this new playlist I discovered! 🎵 #music #discovery', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '2 hours'),
('Nothing beats a good home-cooked meal! 🍳 #cooking #food', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '1 hour');

-- Add some additional sample chirps for variety
INSERT INTO chirps (content, author_id, created_at) VALUES
('Welcome to Chirp! This is a test chirp to get you started. 🐦✨', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '30 minutes'),
('Testing the app with Supabase integration. Everything should work smoothly now! 🚀', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '15 minutes'),
('The network error should be resolved now. Let me know if you see this chirp! 👀', '123e4567-e89b-12d3-a456-426614174000', NOW() - INTERVAL '5 minutes');

-- Verify the migration
SELECT 'Mock chirps transferred successfully!' as status;
SELECT COUNT(*) as total_chirps FROM chirps;
SELECT COUNT(*) as total_users FROM users;
