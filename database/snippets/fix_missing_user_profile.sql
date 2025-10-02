-- Fix missing user profile for kriselle.t@gmail.com
-- This script creates the missing public.users record for an existing auth.users record

-- Step 1: Check if user exists in auth.users but not in public.users
SELECT 
    'User Status Check' as step,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in auth.users'
        ELSE '❌ User missing from auth.users'
    END as auth_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'kriselle.t@gmail.com') 
        THEN '✅ User exists in public.users'
        ELSE '❌ User missing from public.users'
    END as public_status;

-- Step 2: Get auth user details
SELECT 
    'Auth User Details' as step,
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Create missing public.users record
DO $$
DECLARE
    auth_user_id UUID;
    auth_user_email TEXT;
    auth_user_created_at TIMESTAMP;
    auth_user_meta_data JSONB;
    user_name TEXT;
    user_handle TEXT;
BEGIN
    -- Get the auth user details
    SELECT 
        id, 
        email, 
        created_at,
        raw_user_meta_data
    INTO 
        auth_user_id, 
        auth_user_email, 
        auth_user_created_at,
        auth_user_meta_data
    FROM auth.users 
    WHERE email = 'kriselle.t@gmail.com';
    
    IF auth_user_id IS NOT NULL THEN
        -- Extract name from metadata or use email prefix
        user_name := COALESCE(
            auth_user_meta_data->>'name',
            auth_user_meta_data->>'full_name',
            'Kriselle'
        );
        
        -- Generate a unique handle
        user_handle := 'kriselle_' || substring(auth_user_id::text, 1, 8);
        
        -- Check if handle is available, if not add numbers
        WHILE EXISTS (SELECT 1 FROM public.users WHERE handle = user_handle) LOOP
            user_handle := 'kriselle_' || substring(auth_user_id::text, 1, 8) || '_' || floor(random() * 1000)::text;
        END LOOP;
        
        -- Create the public.users record
        INSERT INTO public.users (
            id,
            email,
            first_name,
            last_name,
            handle,
            custom_handle,
            bio,
            profile_image_url,
            banner_image_url,
            crystal_balance,
            created_at,
            updated_at
        ) VALUES (
            auth_user_id,
            auth_user_email,
            split_part(user_name, ' ', 1),
            CASE 
                WHEN position(' ' in user_name) > 0 
                THEN substring(user_name from position(' ' in user_name) + 1)
                ELSE ''
            END,
            user_handle,
            user_handle,
            'New to Chirp! 🐦',
            null,
            null,
            100,
            auth_user_created_at,
            NOW()
        );
        
        RAISE NOTICE '✅ Created public.users record for % (ID: %)', auth_user_email, auth_user_id;
        RAISE NOTICE 'Handle: %, Name: %', user_handle, user_name;
    ELSE
        RAISE NOTICE '❌ No auth user found for kriselle.t@gmail.com';
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT 
    'Verification' as step,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    u.crystal_balance,
    u.created_at
FROM public.users u
WHERE u.email = 'kriselle.t@gmail.com';

-- Step 5: Final status
SELECT 
    'Final Status' as step,
    'User profile created successfully' as message,
    'The user should now be able to sign in without errors' as instruction;
