-- Update public user ID to match auth user ID
-- There's already a user in public.users but with wrong ID

-- Step 1: Show the current mismatch before fixing
SELECT 
    'Before fix' as step,
    au.id as auth_id,
    pu.id as public_id,
    pu.email,
    pu.first_name,
    pu.last_name,
    CASE 
        WHEN au.id = pu.id::uuid THEN '✅ IDs match'
        ELSE '❌ IDs mismatch'
    END as status
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 2: Update the public user ID to match auth user ID
UPDATE public.users 
SET 
    id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8',
    updated_at = NOW()
WHERE email = 'kriselle.t@gmail.com';

-- Step 3: Verify the fix
SELECT 
    'After fix' as step,
    au.id as auth_id,
    pu.id as public_id,
    pu.email,
    pu.first_name,
    pu.last_name,
    CASE 
        WHEN au.id = pu.id::uuid THEN '✅ IDs now match'
        ELSE '❌ IDs still mismatch'
    END as status
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'kriselle.t@gmail.com';

-- Step 4: Test the profile query that was failing
SELECT 
    'Profile query test' as step,
    id,
    email,
    first_name,
    last_name,
    handle,
    custom_handle,
    created_at
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8';

-- Step 5: Final verification
SELECT 
    'Final check' as step,
    COUNT(*) as count,
    id,
    email,
    first_name,
    CASE 
        WHEN id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8' THEN '✅ Profile should now load correctly'
        ELSE '❌ Something went wrong'
    END as result
FROM public.users 
WHERE id = 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'
GROUP BY id, email, first_name;
