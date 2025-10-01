-- Check RLS status for all tables in the public schema
-- This script identifies tables that might have similar RLS issues

-- Check which tables have RLS enabled vs disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count,
    CASE 
        WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) > 0 
        THEN '⚠️  RLS DISABLED BUT POLICIES EXIST'
        WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) = 0 
        THEN '⚠️  RLS ENABLED BUT NO POLICIES'
        WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) > 0 
        THEN '✅ RLS ENABLED WITH POLICIES'
        ELSE 'ℹ️  RLS DISABLED, NO POLICIES'
    END as status
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) > 0 THEN 1
        WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) = 0 THEN 2
        ELSE 3
    END,
    tablename;

-- Show detailed policy information for tables with potential issues
SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    p.permissive,
    p.roles,
    p.cmd,
    p.qual,
    p.with_check
FROM pg_policies p
JOIN pg_tables t ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE p.schemaname = 'public'
    AND (
        -- Tables with RLS disabled but policies exist
        (t.rowsecurity = false AND EXISTS (SELECT 1 FROM pg_policies p2 WHERE p2.schemaname = t.schemaname AND p2.tablename = t.tablename))
        OR
        -- Tables with RLS enabled but no policies
        (t.rowsecurity = true AND NOT EXISTS (SELECT 1 FROM pg_policies p2 WHERE p2.schemaname = t.schemaname AND p2.tablename = t.tablename))
    )
ORDER BY p.tablename, p.policyname;
