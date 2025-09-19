-- Fix crystal_balance default value from 500000 to 0
-- This corrects the incorrect default value that was set initially

-- Step 1: Update the column default to 0
ALTER TABLE users ALTER COLUMN crystal_balance SET DEFAULT 0;

-- Step 2: Reset all existing users' crystal balance to 0
-- (This will reset everyone's crystals to 0, which is the correct starting point)
UPDATE users SET crystal_balance = 0;

-- Step 3: Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'crystal_balance';

-- Step 4: Show current crystal balances (should all be 0 now)
SELECT id, handle, crystal_balance FROM users ORDER BY created_at DESC LIMIT 10;
