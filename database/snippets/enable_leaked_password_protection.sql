-- Enable Leaked Password Protection in Supabase Auth
-- This script enables protection against known compromised passwords

-- Note: This setting is typically configured through the Supabase Dashboard
-- Go to: Authentication > Settings > Password Protection
-- Enable "Check passwords against known data breaches"

-- However, we can also set it via SQL if the setting exists
-- Check current auth settings
SELECT 
    key,
    value,
    description
FROM auth.config 
WHERE key LIKE '%password%' OR key LIKE '%breach%' OR key LIKE '%leak%';

-- If the setting exists, enable it
-- (This may not work depending on Supabase version and configuration)
-- UPDATE auth.config 
-- SET value = 'true'
-- WHERE key = 'password_breach_check_enabled';

-- Alternative: Check if we can set it via extension
-- This is a placeholder - actual implementation depends on Supabase version
DO $$
BEGIN
    -- Try to enable password breach checking if available
    BEGIN
        -- This is a hypothetical setting - actual syntax may vary
        -- ALTER SYSTEM SET password_breach_check = 'on';
        -- SELECT pg_reload_conf();
        
        RAISE NOTICE 'Password breach checking configuration attempted';
        RAISE NOTICE 'Please verify in Supabase Dashboard: Authentication > Settings > Password Protection';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Password breach checking not available via SQL - configure in Dashboard';
    END;
END $$;

-- Show current password-related settings
SELECT 
    'Password Protection Status' as setting,
    'Configure in Supabase Dashboard' as value,
    'Authentication > Settings > Password Protection' as location;

-- Instructions for manual configuration
SELECT 
    'Manual Configuration Required' as status,
    'Go to Supabase Dashboard > Authentication > Settings > Password Protection' as step1,
    'Enable "Check passwords against known data breaches"' as step2,
    'Save settings' as step3;
