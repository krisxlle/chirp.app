-- Add quantity column to user_collections table
-- This allows users to collect multiple copies of the same profile

-- Add quantity column with default value of 1
ALTER TABLE user_collections 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Update existing records to have quantity 1
UPDATE user_collections 
SET quantity = 1 
WHERE quantity IS NULL;

-- Remove the unique constraint since we now allow duplicates
ALTER TABLE user_collections 
DROP CONSTRAINT IF EXISTS user_collections_user_id_collected_user_id_key;

-- Add a new unique constraint that includes quantity (though we'll handle this in application logic)
-- Actually, let's not add a unique constraint since we want to allow multiple entries
-- The application will handle duplicate detection and quantity updates

-- Add index for better performance on quantity queries
CREATE INDEX IF NOT EXISTS idx_user_collections_quantity 
ON user_collections(user_id, quantity);

-- Add index for better performance on user collection lookups
CREATE INDEX IF NOT EXISTS idx_user_collections_user_collected 
ON user_collections(user_id, collected_user_id);
