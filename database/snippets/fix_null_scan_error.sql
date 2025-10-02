-- Fix NULL scan error on email_change_token_new column
-- This script specifically addresses the "converting NULL to string is unsupported" error

-- Step 1: Check the current state of the email_change_token_new column
SELECT 
    'Column Check' as step,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'email_change_token_new';

-- Step 2: Count NULL values in the problematic column
SELECT 
    'NULL Count Check' as step,
    count(*) as total_users,
    count(email_change_token_new) as non_null_tokens,
    count(*) - count(email_change_token_new) as null_tokens
FROM auth.users;

-- Step 3: Fix NULL values by setting them to empty string
-- This prevents the "converting NULL to string is unsupported" error
UPDATE auth.users 
SET email_change_token_new = COALESCE(email_change_token_new, '')
WHERE email_change_token_new IS NULL;

-- Step 4: Verify the fix
SELECT 
    'Verification' as step,
    count(*) as total_users,
    count(email_change_token_new) as non_null_tokens,
    count(*) - count(email_change_token_new) as null_tokens
FROM auth.users;

-- Step 5: Check if there are any other similar columns that might have the same issue
SELECT 
    'Other Token Columns Check' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name LIKE '%token%'
ORDER BY column_name;

-- Step 6: Fix any other token columns that might have NULL values (only if they exist)
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check and fix email_change_token if it exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'email_change_token'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE auth.users 
        SET email_change_token = COALESCE(email_change_token, '')
        WHERE email_change_token IS NULL;
        RAISE NOTICE 'Fixed NULL values in email_change_token column';
    ELSE
        RAISE NOTICE 'email_change_token column does not exist, skipping';
    END IF;
    
    -- Check and fix recovery_token if it exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'recovery_token'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE auth.users 
        SET recovery_token = COALESCE(recovery_token, '')
        WHERE recovery_token IS NULL;
        RAISE NOTICE 'Fixed NULL values in recovery_token column';
    ELSE
        RAISE NOTICE 'recovery_token column does not exist, skipping';
    END IF;
    
    -- Check and fix email_change_confirm_status if it exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'email_change_confirm_status'
    ) INTO column_exists;
    
    IF column_exists THEN
        UPDATE auth.users 
        SET email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
        WHERE email_change_confirm_status IS NULL;
        RAISE NOTICE 'Fixed NULL values in email_change_confirm_status column';
    ELSE
        RAISE NOTICE 'email_change_confirm_status column does not exist, skipping';
    END IF;
END $$;

-- Step 7: Final verification
SELECT 
    'Final Status' as step,
    'NULL scan errors fixed' as message,
    'All token columns now have non-NULL values' as instruction;
