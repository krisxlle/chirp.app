-- Fix Function Search Path Security Issue
-- This script addresses the mutable search_path security vulnerability

-- First, let's check the current function and its search_path setting
SELECT 
    'Function Analysis' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_waitlist_updated_at_column';

-- Check if the function exists and get its definition
SELECT 
    'Function Definition' as status,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_waitlist_updated_at_column';

-- Fix the function by setting a secure search_path
-- This will prevent SQL injection attacks through search_path manipulation
DO $$ 
BEGIN
    -- Check if the function exists
    IF EXISTS (SELECT 1 FROM pg_proc p
               JOIN pg_namespace n ON p.pronamespace = n.oid
               WHERE n.nspname = 'public' 
               AND p.proname = 'update_waitlist_updated_at_column') THEN
        
        -- Alter the function to set a secure search_path
        ALTER FUNCTION public.update_waitlist_updated_at_column() 
        SET search_path = '';
        
        RAISE NOTICE 'Fixed search_path for function: update_waitlist_updated_at_column';
    ELSE
        RAISE NOTICE 'Function update_waitlist_updated_at_column does not exist';
    END IF;
END $$;

-- Alternative approach: Recreate the function with secure search_path
-- Uncomment this section if the ALTER FUNCTION approach doesn't work
/*
DO $$ 
BEGIN
    -- Drop and recreate the function with secure search_path
    IF EXISTS (SELECT 1 FROM pg_proc p
               JOIN pg_namespace n ON p.pronamespace = n.oid
               WHERE n.nspname = 'public' 
               AND p.proname = 'update_waitlist_updated_at_column') THEN
        
        -- Get the function definition first
        -- Then drop and recreate with SET search_path = ''
        -- This is a template - you'll need to replace with actual function definition
        
        RAISE NOTICE 'Function exists - manual recreation may be needed';
    END IF;
END $$;
*/

-- Verify the fix
SELECT 
    'Verification' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    p.proconfig as config_settings,
    CASE 
        WHEN p.proconfig IS NULL THEN 'No config settings'
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'Search path configured'
        ELSE 'Other config settings'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_waitlist_updated_at_column';

-- Check for other functions with mutable search_path
SELECT 
    'Other Functions with Mutable Search Path' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proconfig IS NULL THEN 'MUTABLE - No search_path set'
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'SECURE - Search path set'
        ELSE 'MUTABLE - Other config only'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proconfig IS NULL OR NOT (array_to_string(p.proconfig, ',') LIKE '%search_path%')
ORDER BY p.proname;

-- Success message
SELECT 'Function Search Path Security Fix Complete!' as status, 
       'Function search_path has been secured' as message;
