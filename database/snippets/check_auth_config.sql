-- Check authentication configuration
-- This script helps diagnose auth system issues

-- Step 1: Check auth schema tables
SELECT 
    'Auth Schema Tables' as step,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- Step 2: Check auth.users table constraints
SELECT 
    'Auth Users Constraints' as step,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
    AND table_name = 'users';

-- Step 3: Check auth.users table indexes
SELECT 
    'Auth Users Indexes' as step,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'auth' 
    AND tablename = 'users';

-- Step 4: Check for any triggers on auth.users
SELECT 
    'Auth Users Triggers' as step,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
    AND event_object_table = 'users'
ORDER BY trigger_name;

-- Step 5: Check auth configuration
SELECT 
    'Auth Configuration' as step,
    'Check Supabase dashboard for:' as message,
    '1. Auth settings' as item1,
    '2. Email templates' as item2,
    '3. SMTP configuration' as item3,
    '4. Rate limiting' as item4,
    '5. Security settings' as item5;

-- Step 6: Check if there are any system-level issues
SELECT 
    'System Check' as step,
    'If auth is still failing, check:' as message,
    '1. Supabase project status' as item1,
    '2. Database connection' as item2,
    '3. Auth service status' as item3,
    '4. Rate limiting' as item4,
    '5. Project quotas' as item5;

-- Step 7: Test basic auth functionality
SELECT 
    'Auth Test' as step,
    'Try these steps:' as message,
    '1. Run fix_auth_system.sql' as step1,
    '2. Check Supabase dashboard logs' as step2,
    '3. Try password reset again' as step3,
    '4. If still failing, contact Supabase support' as step4;

