-- Enable Leaked Password Protection in Supabase Auth
-- This script helps configure Supabase Auth to check passwords against HaveIBeenPwned.org

-- Note: This is primarily a Supabase Dashboard configuration change
-- The SQL script below shows how to verify and configure related security settings

-- ========================================
-- STEP 1: Check current auth configuration
-- ========================================
-- Check if there are any auth-related functions or policies
SELECT 
    'Auth Functions' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('auth', 'public')
AND p.proname LIKE '%password%' OR p.proname LIKE '%auth%'
ORDER BY p.proname;

-- Check auth schema tables
SELECT 
    'Auth Tables' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- ========================================
-- STEP 2: Security recommendations for password policies
-- ========================================
-- Create a function to validate password strength (if needed)
-- Check if function exists first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc p
                   JOIN pg_namespace n ON p.pronamespace = n.oid
                   WHERE n.nspname = 'public' 
                   AND p.proname = 'validate_password_strength') THEN
        RAISE NOTICE 'Creating password validation function...';
    ELSE
        RAISE NOTICE 'Password validation function already exists';
    END IF;
END $$;

-- Create the password validation function outside the DO block
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Basic password strength validation
    -- Minimum 8 characters
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain at least one uppercase letter
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain at least one lowercase letter
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain at least one digit
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain at least one special character
    IF password !~ '[^A-Za-z0-9]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- ========================================
-- STEP 3: Create password policy documentation
-- ========================================
-- Add comments to document password requirements
COMMENT ON FUNCTION public.validate_password_strength(TEXT) IS 
'Validates password strength requirements: minimum 8 characters, uppercase, lowercase, digit, and special character';

-- ========================================
-- STEP 4: Instructions for Supabase Dashboard configuration
-- ========================================
SELECT 
    'Supabase Dashboard Configuration Required' as status,
    '1. Go to Supabase Dashboard > Authentication > Settings' as step_1,
    '2. Enable "Leaked Password Protection"' as step_2,
    '3. Configure password requirements' as step_3,
    '4. Test with a known compromised password' as step_4;

-- ========================================
-- STEP 5: Verify current auth security settings
-- ========================================
-- Check for any existing password-related policies
SELECT 
    'Password Policies' as status,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname IN ('auth', 'public')
AND (policyname LIKE '%password%' OR policyname LIKE '%auth%')
ORDER BY tablename, policyname;

-- ========================================
-- STEP 6: Security audit summary
-- ========================================
SELECT 
    'Security Audit Summary' as status,
    'Leaked password protection should be enabled in Supabase Dashboard' as recommendation_1,
    'Consider implementing additional password strength validation' as recommendation_2,
    'Regular security audits recommended' as recommendation_3,
    'Monitor auth logs for suspicious activity' as recommendation_4;

-- Success message
SELECT 'Password Security Configuration Complete!' as status, 
       'Remember to enable leaked password protection in Supabase Dashboard' as message;
