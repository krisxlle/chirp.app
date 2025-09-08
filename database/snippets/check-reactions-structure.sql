-- Quick test to check if emoji column still exists
-- Run this in Supabase SQL Editor to check current table structure

SELECT 
    'Current reactions table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reactions'
ORDER BY ordinal_position;