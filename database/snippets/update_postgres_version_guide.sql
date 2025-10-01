-- Postgres Version Update Guide
-- This script provides information about updating Postgres version

-- Check current Postgres version
SELECT 
    version() as current_version,
    current_setting('server_version') as server_version,
    current_setting('server_version_num') as version_number;

-- Check available Postgres versions in Supabase
-- Note: Version updates are typically done through the Supabase Dashboard
-- Go to: Settings > Database > Version

-- Show current version details
SELECT 
    'Current Postgres Version' as info_type,
    version() as details
UNION ALL
SELECT 
    'Update Location' as info_type,
    'Supabase Dashboard > Settings > Database > Version' as details
UNION ALL
SELECT 
    'Recommended Action' as info_type,
    'Update to latest available version for security patches' as details;

-- Check for any version-specific security issues
-- This is a placeholder for version-specific checks
DO $$
DECLARE
    current_version_num INTEGER;
BEGIN
    current_version_num := current_setting('server_version_num')::INTEGER;
    
    -- Check if version is older than recommended versions
    IF current_version_num < 150000 THEN
        RAISE NOTICE 'Postgres version is older than 15.0 - consider updating for security patches';
    ELSIF current_version_num < 160000 THEN
        RAISE NOTICE 'Postgres version is older than 16.0 - consider updating for latest security patches';
    ELSE
        RAISE NOTICE 'Postgres version appears to be current';
    END IF;
    
    RAISE NOTICE 'Current version: %', version();
    RAISE NOTICE 'Version number: %', current_version_num;
END $$;

-- Instructions for updating
SELECT 
    'Postgres Update Instructions' as title,
    '1. Go to Supabase Dashboard' as step1,
    '2. Navigate to Settings > Database' as step2,
    '3. Click on Version section' as step3,
    '4. Select latest available version' as step4,
    '5. Follow update prompts' as step5,
    '6. Test application after update' as step6;

-- Warning about updates
SELECT 
    'Important Notes' as category,
    'Database updates may cause temporary downtime' as note1,
    'Test thoroughly in staging environment first' as note2,
    'Backup database before updating' as note3,
    'Check application compatibility with new version' as note4;
