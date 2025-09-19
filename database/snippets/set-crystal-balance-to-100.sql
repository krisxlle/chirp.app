-- Set crystal_balance default value to 100 for new users
-- This gives users 100 crystals when they first sign up

-- Step 1: Update the column default to 100
ALTER TABLE users ALTER COLUMN crystal_balance SET DEFAULT 100;

-- Step 2: Set existing users who have 0 crystals to 100
-- (This gives existing users a starting balance)
UPDATE users SET crystal_balance = 100 WHERE crystal_balance = 0 OR crystal_balance IS NULL;

-- Step 3: Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'crystal_balance';

-- Step 4: Show current crystal balances
SELECT id, handle, crystal_balance FROM users ORDER BY created_at DESC LIMIT 10;
