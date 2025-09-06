-- Fix emoji column constraint issue
-- The database still has an emoji column that requires a value

-- Step 1: Check the current table structure
SELECT 
    'Current Table Structure' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if emoji column exists and its constraints
SELECT 
    'Emoji Column Info' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reactions' 
AND table_schema = 'public'
AND column_name = 'emoji';

-- Step 3: Fix the emoji column to allow NULL values
ALTER TABLE public.reactions ALTER COLUMN emoji DROP NOT NULL;

-- Step 4: Or alternatively, set a default value
-- ALTER TABLE public.reactions ALTER COLUMN emoji SET DEFAULT 'like';

-- Step 5: Test the fix
SELECT 
    'Fix Test' as test,
    COUNT(*) as reaction_count
FROM public.reactions;
