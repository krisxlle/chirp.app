-- Add crystal_balance column to users table
ALTER TABLE users ADD COLUMN crystal_balance INTEGER DEFAULT 500000;

-- Update existing users to have the default crystal balance
UPDATE users SET crystal_balance = 500000 WHERE crystal_balance IS NULL;
