-- Add crystal_balance column to users table in Supabase
-- Run this in the Supabase SQL Editor

-- Step 1: Add the crystal_balance column with default value
ALTER TABLE users ADD COLUMN crystal_balance INTEGER DEFAULT 500000;

-- Step 2: Update any existing users to have the default crystal balance
UPDATE users SET crystal_balance = 500000 WHERE crystal_balance IS NULL;

-- Step 3: Verify the column was added (optional)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'crystal_balance';
