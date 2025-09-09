-- Quick test to check if image columns exist in chirps table
-- Run this in Supabase SQL Editor to see the current table structure

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chirps' 
AND column_name IN ('image_url', 'image_alt_text', 'image_width', 'image_height')
ORDER BY column_name;
