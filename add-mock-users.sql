-- Add mock users for profile cards
INSERT INTO users (id, email, first_name, last_name, display_name, custom_handle, handle, bio, profile_image_url, crystal_balance, created_at) VALUES
('1', 'alex.chen@example.com', 'Alex', 'Chen', 'Alex Chen', 'alex_chen', 'alex_chen', 'Building the future, one algorithm at a time. AI enthusiast, coffee addict, and occasional philosopher.', '/generated-images/avatar_1.png', 125000, NOW()),
('2', 'maya.rodriguez@example.com', 'Maya', 'Rodriguez', 'Maya Rodriguez', 'maya_rodriguez', 'maya_rodriguez', 'Protecting our oceans, one coral reef at a time. Diver, scientist, and advocate for marine conservation.', '/generated-images/avatar_2.png', 89000, NOW()),
('3', 'jordan.kim@example.com', 'Jordan', 'Kim', 'Jordan Kim', 'jordan_kim', 'jordan_kim', 'Gaming is life, life is gaming. Pro player turned commentator. Always chasing that perfect play.', '/generated-images/avatar_3.png', 67000, NOW()),
('4', 'sarah.williams@example.com', 'Sarah', 'Williams', 'Sarah Williams', 'sarah_williams', 'sarah_williams', 'Creating magic in the kitchen and sharing it with the world. Food is love, cooking is therapy.', '/generated-images/avatar_4.png', 45000, NOW()),
('5', 'marcus.johnson@example.com', 'Marcus', 'Johnson', 'Marcus Johnson', 'marcus_johnson', 'marcus_johnson', 'From the field to the stage. Using sports to inspire and motivate others to reach their potential.', '/generated-images/avatar_5.png', 156000, NOW()),
('6', 'luna.patel@example.com', 'Luna', 'Patel', 'Luna Patel', 'luna_patel', 'luna_patel', 'Exploring the cosmos from my backyard telescope. The universe is vast, and so are the possibilities.', '/generated-images/avatar_6.png', 78000, NOW()),
('7', 'david.thompson@example.com', 'David', 'Thompson', 'David Thompson', 'david_thompson', 'david_thompson', 'Strumming strings and teaching others to find their rhythm. Music connects us all.', '/generated-images/avatar_7.png', 23000, NOW()),
('8', 'emma.davis@example.com', 'Emma', 'Davis', 'Emma Davis', 'emma_davis', 'emma_davis', 'Lost in stories, creating my own. Books are my escape and my inspiration.', '/generated-images/avatar_8.png', 12000, NOW());

-- Add some mock chirps for these users
INSERT INTO chirps (author_id, content, created_at) VALUES
('1', 'Just deployed a new AI model that can predict user behavior with 95% accuracy. The future is here! 🤖', NOW()),
('1', 'Coffee is the fuel that powers my algorithms. Without it, I am but a mere mortal. ☕', NOW()),
('2', 'Today I discovered a new coral species in the Great Barrier Reef. Nature never ceases to amaze me! 🌊', NOW()),
('2', 'Remember: every plastic bottle you don\'t use saves a marine life. Small actions, big impact. 🐠', NOW()),
('3', 'Just pulled off the most insane combo in tournament history! The crowd went wild! 🎮', NOW()),
('3', 'Gaming isn\'t just entertainment, it\'s a way of life. Every match teaches you something new.', NOW()),
('4', 'Made the most delicious sourdough bread today. The secret? Patience and love. 🍞', NOW()),
('4', 'Food connects us all. Whether you\'re cooking for one or a hundred, put your heart into it.', NOW()),
('5', 'Today\'s workout was intense! Remember, your body can do amazing things if you believe in it. 💪', NOW()),
('5', 'Sports teach us discipline, teamwork, and perseverance. Life lessons on the field.', NOW()),
('6', 'Spent the night stargazing. The Andromeda galaxy was particularly bright tonight. ✨', NOW()),
('6', 'The universe is 13.8 billion years old, and we get to witness its beauty. How lucky are we?', NOW()),
('7', 'Music has the power to heal, to inspire, to bring people together. That\'s why I teach. 🎸', NOW()),
('7', 'Today\'s guitar lesson was magical. Watching someone discover their musical voice never gets old.', NOW()),
('8', 'Just finished reading "The Midnight Library" by Matt Haig. What a beautiful exploration of life\'s infinite possibilities! 📚', NOW()),
('8', 'Books are portals to other worlds, other lives, other perspectives. They make us more human.', NOW());

-- Add some mock follows (create a small network)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
('1', '2', NOW()),
('1', '3', NOW()),
('2', '1', NOW()),
('2', '4', NOW()),
('3', '1', NOW()),
('3', '5', NOW()),
('4', '2', NOW()),
('4', '6', NOW()),
('5', '3', NOW()),
('5', '7', NOW()),
('6', '4', NOW()),
('6', '8', NOW()),
('7', '5', NOW()),
('7', '1', NOW()),
('8', '6', NOW()),
('8', '2', NOW());
