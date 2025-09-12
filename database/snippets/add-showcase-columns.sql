-- Add showcase columns to user_collections table
-- This allows users to select up to 6 profiles for their showcase

-- Add is_showcase column (boolean to mark if profile is in showcase)
ALTER TABLE user_collections 
ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT FALSE NOT NULL;

-- Add showcase_order column (integer to define order in showcase, 1-6)
ALTER TABLE user_collections 
ADD COLUMN IF NOT EXISTS showcase_order INTEGER DEFAULT NULL;

-- Add constraint to ensure showcase_order is between 1 and 6
ALTER TABLE user_collections 
ADD CONSTRAINT IF NOT EXISTS check_showcase_order 
CHECK (showcase_order IS NULL OR (showcase_order >= 1 AND showcase_order <= 6));

-- Create index for better performance on showcase queries
CREATE INDEX IF NOT EXISTS idx_user_collections_showcase 
ON user_collections(user_id, is_showcase, showcase_order);

-- Create index for showcase order queries
CREATE INDEX IF NOT EXISTS idx_user_collections_showcase_order 
ON user_collections(user_id, showcase_order) 
WHERE is_showcase = TRUE;

-- Success message
SELECT 'Showcase columns added to user_collections table successfully!' as status;
