-- Make handle constraints case-insensitive
-- This script updates the unique constraints on handle and custom_handle to be case-insensitive

-- Drop existing unique constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_handle_unique;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_custom_handle_unique;

-- Create case-insensitive unique constraints using functional indexes
CREATE UNIQUE INDEX users_handle_unique_ci ON users (LOWER(handle));
CREATE UNIQUE INDEX users_custom_handle_unique_ci ON users (LOWER(custom_handle)) WHERE custom_handle IS NOT NULL;

-- Add comments to document the case-insensitive constraints
COMMENT ON INDEX users_handle_unique_ci IS 'Case-insensitive unique constraint on handle field';
COMMENT ON INDEX users_custom_handle_unique_ci IS 'Case-insensitive unique constraint on custom_handle field';

-- Success message
SELECT 'Handle constraints updated to be case-insensitive!' as status;
