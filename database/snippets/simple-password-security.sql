-- Simple Leaked Password Protection Setup
-- This script provides basic security measures and instructions

-- ========================================
-- STEP 1: Check current auth configuration
-- ========================================
SELECT 
    'Auth Functions' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('auth', 'public')
AND (p.proname LIKE '%password%' OR p.proname LIKE '%auth%')
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
-- STEP 2: Create password validation function
-- ========================================
-- Create a simple password validation function
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
-- STEP 3: Add function documentation
-- ========================================
COMMENT ON FUNCTION public.validate_password_strength(TEXT) IS 
'Validates password strength requirements: minimum 8 characters, uppercase, lowercase, digit, and special character';

-- ========================================
-- STEP 4: Test the function
-- ========================================
SELECT 
    'Password Validation Tests' as status,
    'weak123' as test_password,
    public.validate_password_strength('weak123') as is_valid;

SELECT 
    'Password Validation Tests' as status,
    'StrongP@ss123' as test_password,
    public.validate_password_strength('StrongP@ss123') as is_valid;

-- ========================================
-- STEP 5: Supabase Dashboard Instructions
-- ========================================
SELECT 
    'Supabase Dashboard Configuration Required' as status,
    '1. Go to Supabase Dashboard > Authentication > Settings' as step_1,
    '2. Enable "Leaked Password Protection"' as step_2,
    '3. Configure password requirements' as step_3,
    '4. Test with a known compromised password' as step_4;

-- ========================================
-- STEP 6: Check for existing password policies
-- ========================================
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
-- STEP 7: Security recommendations
-- ========================================
SELECT 
    'Security Recommendations' as status,
    '1. Enable leaked password protection in Supabase Dashboard' as recommendation_1,
    '2. Use the password validation function in your app' as recommendation_2,
    '3. Enable multi-factor authentication' as recommendation_3,
    '4. Monitor authentication logs regularly' as recommendation_4;

-- Success message
SELECT 'Password Security Setup Complete!' as status, 
       'Remember to enable leaked password protection in Supabase Dashboard' as message;
