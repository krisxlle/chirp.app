-- Cleanup foreign key dependencies
-- This script finds and removes all foreign key references before deleting the user

-- Step 1: Find the user ID
SELECT 
    'Finding User ID' as step,
    id as target_user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 2: Find all foreign key references to this user
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    target_user_id UUID;
    deleted_count INTEGER;
BEGIN
    -- Get the user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user ID: %', target_user_id;
    
    -- Delete from all tables that reference this user
    -- Note: We'll delete from child tables first, then parent tables
    
    -- Delete from chirps
    DELETE FROM public.chirps WHERE public.chirps.author_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % chirps', deleted_count;
    
    -- Delete from reactions
    DELETE FROM public.reactions WHERE public.reactions.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % reactions', deleted_count;
    
    -- Delete from reposts
    DELETE FROM public.reposts WHERE public.reposts.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % reposts', deleted_count;
    
    -- Delete from follows (both directions)
    DELETE FROM public.follows WHERE public.follows.follower_id = target_user_id OR public.follows.following_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % follows', deleted_count;
    
    -- Delete from notifications
    DELETE FROM public.notifications WHERE public.notifications.user_id = target_user_id OR public.notifications.from_user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % notifications', deleted_count;
    
    -- Delete from user_blocks
    DELETE FROM public.user_blocks WHERE public.user_blocks.blocker_id = target_user_id OR public.user_blocks.blocked_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_blocks', deleted_count;
    
    -- Delete from user_collections
    DELETE FROM public.user_collections WHERE public.user_collections.user_id = target_user_id OR public.user_collections.collected_user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_collections', deleted_count;
    
    -- Delete from user_notification_settings
    DELETE FROM public.user_notification_settings WHERE public.user_notification_settings.user_id = target_user_id OR public.user_notification_settings.followed_user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_notification_settings', deleted_count;
    
    -- Delete from user_equipped_frames
    DELETE FROM public.user_equipped_frames WHERE public.user_equipped_frames.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_equipped_frames', deleted_count;
    
    -- Delete from user_frame_collections
    DELETE FROM public.user_frame_collections WHERE public.user_frame_collections.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_frame_collections', deleted_count;
    
    -- Delete from push_tokens
    DELETE FROM public.push_tokens WHERE public.push_tokens.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % push_tokens', deleted_count;
    
    -- Delete from feedback
    DELETE FROM public.feedback WHERE public.feedback.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % feedback', deleted_count;
    
    -- Delete from profiles
    DELETE FROM public.profiles WHERE public.profiles.user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', deleted_count;
    
    -- Delete from relationships
    DELETE FROM public.relationships WHERE public.relationships.follower_id = target_user_id OR public.relationships.following_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % relationships', deleted_count;
    
    -- Delete from link_shares
    DELETE FROM public.link_shares WHERE public.link_shares.user_id = target_user_id OR public.link_shares.shared_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % link_shares', deleted_count;
    
    -- Delete from invitations
    DELETE FROM public.invitations WHERE public.invitations.inviter_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % invitations', deleted_count;
    
    -- Delete from vip_codes
    DELETE FROM public.vip_codes WHERE public.vip_codes.used_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % vip_codes', deleted_count;
    
    -- Now delete from public.users
    DELETE FROM public.users WHERE public.users.id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % public users', deleted_count;
    
    -- Finally delete from auth.users
    DELETE FROM auth.users WHERE auth.users.id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', deleted_count;
    
    RAISE NOTICE 'User and all dependencies deleted successfully';
END $$;

-- Step 3: Verify cleanup
SELECT 
    'Verification - auth.users' as step,
    count(*) as user_count,
    'Should be 0' as expected
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

SELECT 
    'Verification - public.users' as step,
    count(*) as user_count,
    'Should be 0' as expected
FROM public.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 4: Create a fresh user
DO $$
DECLARE
    user_email TEXT := 'kriselle.t@gmail.com';
    auth_target_user_id UUID;
BEGIN
    -- Create new auth user
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud, instance_id
    ) VALUES (
        gen_random_uuid(),
        user_email,
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{}',
        '{"name": "Kriselle T"}',
        false,
        'authenticated',
        'authenticated',
        gen_random_uuid()
    );
    
    -- Get the new auth user ID
    SELECT id INTO auth_target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    RAISE NOTICE 'Created new auth user with ID: %', auth_target_user_id;
    
    -- Create new public user with matching ID
    INSERT INTO public.users (
        id, email, first_name, last_name, handle, created_at, updated_at
    ) VALUES (
        auth_target_user_id,
        user_email,
        'Kriselle',
        'T',
        'kriselle',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Created new public user with ID: %', auth_target_user_id;
END $$;

-- Step 5: Verify the new user
SELECT 
    'New User Verification' as step,
    au.id as auth_id,
    au.email,
    au.encrypted_password IS NOT NULL as has_password,
    au.email_confirmed_at,
    au.role,
    au.aud,
    u.id as public_id,
    u.first_name,
    u.last_name,
    u.handle,
    CASE 
        WHEN au.id = u.id THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as id_status
FROM auth.users au
JOIN public.users u ON au.email = u.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 6: Test password verification
SELECT 
    'Password Test' as step,
    email,
    CASE 
        WHEN encrypted_password = crypt('password123', encrypted_password) THEN '✅ Password matches'
        ELSE '❌ Password does not match'
    END as password_test
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 7: Final status
SELECT 
    'Final Status' as step,
    'User completely recreated after cleaning foreign key dependencies' as message,
    'Email: kriselle.t@gmail.com' as email,
    'Password: password123' as password;
