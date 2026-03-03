-- Migration: Add Device Tracking for Inferred Identity
-- Date: February 14, 2026
-- Purpose: Track devices and browsers associated with user accounts for identity inference

-- Create user_devices table
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  user_agent TEXT,
  platform VARCHAR(100),
  screen_resolution VARCHAR(50),
  language VARCHAR(20),
  timezone VARCHAR(100),
  ip_address INET,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_seen ON user_devices(last_seen DESC);

-- Unique constraint to prevent duplicate device associations
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_unique ON user_devices(user_id, device_id);

-- Comments
COMMENT ON TABLE user_devices IS 'Tracks devices and browsers associated with user accounts for identity inference and security';
COMMENT ON COLUMN user_devices.device_id IS 'Browser fingerprint hash for device identification';
COMMENT ON COLUMN user_devices.user_agent IS 'Full user agent string for browser/device info';
COMMENT ON COLUMN user_devices.ip_address IS 'IP address of device (if available)';
COMMENT ON COLUMN user_devices.is_active IS 'Whether this device is currently active';

-- Enable Row Level Security
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own devices
CREATE POLICY user_devices_select_policy ON user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert device records
CREATE POLICY user_devices_insert_policy ON user_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own device records
CREATE POLICY user_devices_update_policy ON user_devices
  FOR UPDATE
  USING (auth.uid() = user_id);
