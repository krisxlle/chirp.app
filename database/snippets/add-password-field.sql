-- Add password field to users table
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

-- Update existing users to have a default password (for testing)
UPDATE users SET password_hash = 'password123' WHERE password_hash IS NULL;
