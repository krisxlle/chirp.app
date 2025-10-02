-- Migrate Custom Auth Users to Supabase Auth
-- This script migrates existing users from custom auth to Supabase Auth

-- Step 1: Check existing users in custom auth
SELECT 
    'Custom Auth Users' as source,
    COUNT(*) as user_count,
    MIN(created_at) as oldest_user,
    MAX(created_at) as newest_user
FROM public.users;

-- Step 2: Check existing users in Supabase Auth
SELECT 
    'Supabase Auth Users' as source,
    COUNT(*) as user_count,
    MIN(created_at) as oldest_user,
    MAX(created_at) as newest_user
FROM auth.users;

-- Step 3: Find users that exist in custom auth but not in Supabase Auth
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.custom_handle,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.email IS NULL
ORDER BY u.created_at;

-- Step 4: Create a function to migrate a single user
CREATE OR REPLACE FUNCTION migrate_user_to_supabase_auth(
    user_email TEXT,
    user_password TEXT DEFAULT 'password123'
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    user_id UUID
) AS $$
DECLARE
    custom_user RECORD;
    new_auth_user UUID;
    migration_error TEXT;
BEGIN
    -- Get the custom auth user
    SELECT * INTO custom_user
    FROM public.users
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found in custom auth', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if user already exists in Supabase Auth
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RETURN QUERY SELECT FALSE, 'User already exists in Supabase Auth', NULL::UUID;
        RETURN;
    END IF;
    
    BEGIN
        -- Create user in Supabase Auth
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            last_sign_in_at,
            email_change,
            email_change_sent_at,
            confirmation_token,
            recovery_token,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            user_email,
            crypt(user_password, gen_salt('bf')),
            NOW(),
            custom_user.created_at,
            NOW(),
            '{}',
            jsonb_build_object(
                'name', COALESCE(custom_user.first_name || ' ' || custom_user.last_name, custom_user.first_name, 'User'),
                'first_name', custom_user.first_name,
                'last_name', custom_user.last_name,
                'custom_handle', custom_user.custom_handle
            ),
            FALSE,
            NULL,
            '',
            NULL,
            '',
            '',
            0,
            NULL,
            '',
            NULL,
            FALSE,
            NULL
        ) RETURNING id INTO new_auth_user;
        
        -- Update the custom auth user with the new Supabase Auth ID
        UPDATE public.users 
        SET id = new_auth_user::TEXT
        WHERE email = user_email;
        
        RETURN QUERY SELECT TRUE, 'User migrated successfully', new_auth_user;
        
    EXCEPTION WHEN OTHERS THEN
        migration_error := SQLERRM;
        RETURN QUERY SELECT FALSE, 'Migration failed: ' || migration_error, NULL::UUID;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Migrate all users (run this carefully!)
-- WARNING: This will create accounts for all users with default password 'password123'
-- Users will need to reset their passwords after migration

DO $$
DECLARE
    user_record RECORD;
    migration_result RECORD;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Loop through all users that need migration
    FOR user_record IN 
        SELECT u.email
        FROM public.users u
        LEFT JOIN auth.users au ON u.email = au.email
        WHERE au.email IS NULL
        ORDER BY u.created_at
    LOOP
        -- Migrate each user
        SELECT * INTO migration_result
        FROM migrate_user_to_supabase_auth(user_record.email, 'password123');
        
        IF migration_result.success THEN
            success_count := success_count + 1;
            RAISE NOTICE 'Migrated user: %', user_record.email;
        ELSE
            error_count := error_count + 1;
            RAISE NOTICE 'Failed to migrate user: % - %', user_record.email, migration_result.message;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration complete. Success: %, Errors: %', success_count, error_count;
END $$;

-- Step 6: Verify migration results
SELECT 
    'Migration Results' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN au.email IS NOT NULL THEN 1 END) as migrated_users,
    COUNT(CASE WHEN au.email IS NULL THEN 1 END) as remaining_users
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email;

-- Step 7: Show users that still need migration
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.email IS NULL
ORDER BY u.created_at;

-- Step 8: Clean up the migration function
DROP FUNCTION IF EXISTS migrate_user_to_supabase_auth(TEXT, TEXT);

-- Success message
SELECT 'Custom auth to Supabase auth migration completed!' as status;
