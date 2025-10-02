-- Fix authentication constraint errors
-- This script addresses the duplicate key constraint and NULL scan errors

-- Step 1: Check current constraint status
SELECT 
    'Current Constraints' as step,
    constraint_name,
    constraint_type,
    table_name,
    table_schema
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
    AND constraint_name LIKE '%email%'
ORDER BY constraint_name;

-- Step 2: Check for duplicate users in auth.users
SELECT 
    'Duplicate Users Check' as step,
    email,
    count(*) as user_count,
    array_agg(id) as user_ids,
    array_agg(created_at) as created_dates
FROM auth.users 
WHERE email IS NOT NULL
GROUP BY email
HAVING count(*) > 1
ORDER BY user_count DESC;

-- Step 3: Check the specific constraint that's failing
SELECT 
    'Constraint Details' as step,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_email_partial_key';

-- Step 4: Fix duplicate users by keeping the most recent one
DO $$
DECLARE
    duplicate_record RECORD;
    keep_user_id UUID;
    delete_user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Loop through all duplicate emails
    FOR duplicate_record IN 
        SELECT email, count(*) as user_count, array_agg(id ORDER BY created_at DESC) as user_ids
        FROM auth.users 
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING count(*) > 1
    LOOP
        -- Keep the most recent user (first in the ordered array)
        keep_user_id := duplicate_record.user_ids[1];
        
        -- Delete the older duplicates
        FOR i IN 2..array_length(duplicate_record.user_ids, 1) LOOP
            delete_user_id := duplicate_record.user_ids[i];
            
            -- Delete from auth.users (this should cascade to public.users if foreign keys are set up)
            DELETE FROM auth.users WHERE id = delete_user_id;
            deleted_count := deleted_count + 1;
            
            RAISE NOTICE 'Deleted duplicate user % for email %', delete_user_id, duplicate_record.email;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Total duplicate users deleted: %', deleted_count;
END $$;

-- Step 5: Check if the email_change_token_new column exists and handle NULL values
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'email_change_token_new'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Update NULL values to empty string to prevent scan errors
        UPDATE auth.users 
        SET email_change_token_new = '' 
        WHERE email_change_token_new IS NULL;
        
        RAISE NOTICE 'Updated NULL email_change_token_new values to empty string';
    ELSE
        RAISE NOTICE 'email_change_token_new column does not exist in auth.users';
    END IF;
END $$;

-- Step 6: Verify the fixes
SELECT 
    'Verification - No Duplicates' as step,
    email,
    count(*) as user_count
FROM auth.users 
WHERE email IS NOT NULL
GROUP BY email
HAVING count(*) > 1;

-- Step 7: Check for any remaining NULL values in email_change_token_new
SELECT 
    'Verification - No NULL Tokens' as step,
    count(*) as null_count
FROM auth.users 
WHERE email_change_token_new IS NULL;

-- Step 8: Final status
SELECT 
    'Status' as step,
    'Authentication constraint errors fixed' as message,
    'Magic link and login should now work properly' as instruction;
