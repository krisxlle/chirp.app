-- Add image columns to chirps table (if they don't exist)
-- This script safely adds image support columns

-- Remove any problematic index first
DROP INDEX IF EXISTS idx_chirps_image_url;

-- Add image columns (IF NOT EXISTS prevents errors if already added)
ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_alt_text TEXT;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_width INTEGER;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- Create a safe index on image_width (not on the large image_url)
CREATE INDEX IF NOT EXISTS idx_chirps_has_image ON chirps(image_width) WHERE image_width IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chirps' 
AND column_name IN ('image_url', 'image_alt_text', 'image_width', 'image_height')
ORDER BY column_name;

-- Success message
SELECT 'Image columns added successfully!' as status;
