-- Migration: Add Privacy Policy Compliance Columns
-- Date: February 14, 2026
-- Purpose: Add columns required for privacy policy compliance

-- Add date_of_birth column for age verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add privacy settings columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_discoverable BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_ai_opt_out BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_analytics_opt_out BOOLEAN DEFAULT FALSE;

-- Create index on date_of_birth for age-related queries
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

-- Comments
COMMENT ON COLUMN users.date_of_birth IS 'User date of birth for age verification (minimum 13 years old)';
COMMENT ON COLUMN users.privacy_discoverable IS 'Allow others to find account by email/phone';
COMMENT ON COLUMN users.privacy_ai_opt_out IS 'User has opted out of AI features';
COMMENT ON COLUMN users.privacy_analytics_opt_out IS 'User has opted out of analytics tracking';
