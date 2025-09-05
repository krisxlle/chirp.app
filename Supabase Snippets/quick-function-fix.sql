-- Quick Fix for update_waitlist_updated_at_column Function
-- This script specifically addresses the security alert for this function

-- Fix the specific function mentioned in the security alert
ALTER FUNCTION public.update_waitlist_updated_at_column() 
SET search_path = '';

-- Verify the fix
SELECT 
    'Function Fixed' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    CASE 
        WHEN p.proconfig IS NULL THEN 'No config settings'
        WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'Search path secured'
        ELSE 'Other config settings'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_waitlist_updated_at_column';

SELECT 'Function search_path security fix applied!' as result;
