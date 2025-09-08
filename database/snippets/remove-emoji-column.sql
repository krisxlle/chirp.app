-- Complete fix: Remove emoji column entirely
-- Since we simplified reactions to just "likes", we don't need the emoji column

-- Step 1: Check current structure
SELECT 
    'Before Fix' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Remove the emoji column entirely
ALTER TABLE public.reactions DROP COLUMN IF EXISTS emoji;

-- Step 3: Check structure after fix
SELECT 
    'After Fix' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Test the fix
SELECT 
    'Final Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;
