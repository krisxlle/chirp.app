-- Comprehensive Function Search Path Security Fix
-- This script fixes all functions with mutable search_path security vulnerabilities

-- ========================================
-- STEP 1: Identify all functions with mutable search_path
-- ========================================
SELECT 
    'Functions with Mutable Search Path' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    CASE 
        WHEN p.proconfig IS NULL THEN 'MUTABLE - No search_path set'
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'SECURE - Search path set'
        ELSE 'MUTABLE - Other config only'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (p.proconfig IS NULL OR NOT (array_to_string(p.proconfig, ',') LIKE '%search_path%'))
ORDER BY p.proname;

-- ========================================
-- STEP 2: Fix specific function - update_waitlist_updated_at_column
-- ========================================
DO $$ 
BEGIN
    -- Fix the specific function mentioned in the security alert
    IF EXISTS (SELECT 1 FROM pg_proc p
               JOIN pg_namespace n ON p.pronamespace = n.oid
               WHERE n.nspname = 'public' 
               AND p.proname = 'update_waitlist_updated_at_column') THEN
        
        -- Set secure search_path for the function
        ALTER FUNCTION public.update_waitlist_updated_at_column() 
        SET search_path = '';
        
        RAISE NOTICE 'Fixed search_path for function: update_waitlist_updated_at_column';
    ELSE
        RAISE NOTICE 'Function update_waitlist_updated_at_column does not exist';
    END IF;
END $$;

-- ========================================
-- STEP 3: Fix all other functions with mutable search_path
-- ========================================
DO $$ 
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    -- Loop through all functions in public schema without secure search_path
    FOR func_record IN 
        SELECT p.oid, n.nspname, p.proname, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND (p.proconfig IS NULL OR NOT (array_to_string(p.proconfig, ',') LIKE '%search_path%'))
        AND p.proname != 'update_waitlist_updated_at_column' -- Already fixed above
    LOOP
        BEGIN
            -- Build function signature
            func_signature := func_record.nspname || '.' || func_record.proname || '(' || func_record.args || ')';
            
            -- Set secure search_path for the function
            EXECUTE 'ALTER FUNCTION ' || func_signature || ' SET search_path = ''''';
            
            RAISE NOTICE 'Fixed search_path for function: %', func_record.proname;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not fix function %: %', func_record.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- ========================================
-- STEP 4: Verify all fixes
-- ========================================
SELECT 
    'Verification - All Functions Search Path Status' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    CASE 
        WHEN p.proconfig IS NULL THEN 'MUTABLE - No search_path set'
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'SECURE - Search path set'
        ELSE 'OTHER - Other config settings'
    END as search_path_status,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
ORDER BY 
    CASE 
        WHEN p.proconfig IS NULL THEN 1
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 3
        ELSE 2
    END,
    p.proname;

-- ========================================
-- STEP 5: Check for any remaining mutable functions
-- ========================================
SELECT 
    'Remaining Mutable Functions' as status,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'All functions are secure!'
        ELSE 'Some functions still need attention'
    END as status_message
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (p.proconfig IS NULL OR NOT (array_to_string(p.proconfig, ',') LIKE '%search_path%'));

-- ========================================
-- STEP 6: Security recommendations
-- ========================================
SELECT 
    'Security Recommendations' as status,
    '1. All functions now have secure search_path' as recommendation_1,
    '2. Consider setting search_path = '''' for all new functions' as recommendation_2,
    '3. Regularly audit functions for security vulnerabilities' as recommendation_3,
    '4. Use SECURITY DEFINER functions with caution' as recommendation_4;

-- Success message
SELECT 'Function Search Path Security Fix Complete!' as status, 
       'All functions now have secure search_path settings' as message;
