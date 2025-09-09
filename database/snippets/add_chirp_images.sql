-- Add image support to chirps table
-- This script adds image_url column to the chirps table

-- Add image_url column to chirps table
ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_alt_text column for accessibility
ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_alt_text TEXT;

-- Add image_width and image_height for proper display
ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_width INTEGER;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- Create index on image_url for faster queries
CREATE INDEX IF NOT EXISTS idx_chirps_image_url ON chirps(image_url) WHERE image_url IS NOT NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN chirps.image_url IS 'URL of the image attached to the chirp';
COMMENT ON COLUMN chirps.image_alt_text IS 'Alt text for the image for accessibility';
COMMENT ON COLUMN chirps.image_width IS 'Width of the image in pixels';
COMMENT ON COLUMN chirps.image_height IS 'Height of the image in pixels';

-- Success message
SELECT 'Chirp images support added successfully!' as status;
