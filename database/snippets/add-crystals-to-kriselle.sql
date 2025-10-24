-- Add 50,000 crystals to @kriselle account for testing purposes
-- This script can be run in the Supabase SQL Editor

-- Step 1: Check current crystal balance
SELECT 
    'Current Balance Check' as step,
    id,
    email,
    handle,
    custom_handle,
    crystal_balance
FROM public.users 
WHERE email = 'kriselle.t@gmail.com' OR custom_handle = 'kriselle';

-- Step 2: Add 50,000 crystals to @kriselle account
UPDATE public.users 
SET 
    crystal_balance = crystal_balance + 50000,
    updated_at = NOW()
WHERE email = 'kriselle.t@gmail.com' OR custom_handle = 'kriselle';

-- Step 3: Verify the update
SELECT 
    'Updated Balance Check' as step,
    id,
    email,
    handle,
    custom_handle,
    crystal_balance,
    updated_at
FROM public.users 
WHERE email = 'kriselle.t@gmail.com' OR custom_handle = 'kriselle';

-- Step 4: Show all users with their crystal balances (for reference)
SELECT 
    'All Users Crystal Balances' as step,
    email,
    custom_handle,
    crystal_balance,
    created_at
FROM public.users 
ORDER BY crystal_balance DESC;
