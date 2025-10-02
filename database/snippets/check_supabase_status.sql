-- Check Supabase project status
-- This script helps diagnose if the issue is with the Supabase project itself

-- Step 1: Check database version and status
SELECT 
    'Database Status' as step,
    version() as postgres_version,
    current_database() as database_name,
    current_user as current_user,
    inet_server_addr() as server_ip,
    inet_server_port() as server_port;

-- Step 2: Check if we can access the auth schema
SELECT 
    'Auth Schema Access' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
        THEN '✅ Auth schema exists'
        ELSE '❌ Auth schema missing'
    END as auth_schema_status;

-- Step 3: Check auth.users table accessibility
SELECT 
    'Auth Users Table Access' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
        THEN '✅ Auth users table exists'
        ELSE '❌ Auth users table missing'
    END as auth_users_table_status;

-- Step 4: Check if we can query auth.users
SELECT 
    'Auth Users Query Test' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users LIMIT 1) 
        THEN '✅ Can query auth.users'
        ELSE '❌ Cannot query auth.users'
    END as auth_users_query_status;

-- Step 5: Check public.users table accessibility
SELECT 
    'Public Users Table Access' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
        THEN '✅ Public users table exists'
        ELSE '❌ Public users table missing'
    END as public_users_table_status;

-- Step 6: Check if we can query public.users
SELECT 
    'Public Users Query Test' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users LIMIT 1) 
        THEN '✅ Can query public.users'
        ELSE '❌ Cannot query public.users'
    END as public_users_query_status;

-- Step 7: Check for any active connections
SELECT 
    'Active Connections' as step,
    count(*) as connection_count
FROM pg_stat_activity 
WHERE state = 'active';

-- Step 8: Check for any blocking queries
SELECT 
    'Blocking Queries' as step,
    count(*) as blocking_count
FROM pg_stat_activity 
WHERE state = 'active' 
    AND query NOT LIKE '%pg_stat_activity%';

-- Step 9: Check database size and limits
SELECT 
    'Database Size' as step,
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Step 10: Check if there are any system-level issues
SELECT 
    'System Issues Check' as step,
    'If auth is still failing, the issue might be:' as message,
    '1. Supabase project is down' as item1,
    '2. Database connection limits exceeded' as item2,
    '3. Auth service is down' as item3,
    '4. Rate limiting is blocking requests' as item4,
    '5. Project quotas exceeded' as item5,
    '6. Network connectivity issues' as item6;

-- Step 11: Recommendations
SELECT 
    'Recommendations' as step,
    'Try these steps:' as message,
    '1. Check Supabase dashboard for project status' as step1,
    '2. Check if project is paused or has issues' as step2,
    '3. Try restarting the project' as step3,
    '4. Check project quotas and limits' as step4,
    '5. Contact Supabase support if issues persist' as step5;
