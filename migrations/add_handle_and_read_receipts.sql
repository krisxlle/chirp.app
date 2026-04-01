-- Migration: Add custom handle support and read receipts toggle
-- Date: February 14, 2026

-- Allow users to change their handle
ALTER TABLE users
ADD COLUMN IF NOT EXISTS custom_handle TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_custom_handle BOOLEAN DEFAULT FALSE;

-- Add read receipts preference
ALTER TABLE users
ADD COLUMN IF NOT EXISTS read_receipts_enabled BOOLEAN DEFAULT TRUE;

-- Ensure uniqueness on custom_handle (only when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_custom_handle
ON users(custom_handle) WHERE custom_handle IS NOT NULL;

COMMENT ON COLUMN users.custom_handle IS 'User-chosen handle, must be unique';
COMMENT ON COLUMN users.has_custom_handle IS 'Whether the user has set a custom handle';
COMMENT ON COLUMN users.read_receipts_enabled IS 'Whether the user allows read receipts on messages';
