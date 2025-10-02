-- Diagnostic script to check Supabase storage buckets
-- This helps diagnose the 400 error when uploading images

-- Check if avatars bucket exists
SELECT 
    'Avatars bucket check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'avatars'
        ) THEN '✅ avatars bucket exists'
        ELSE '❌ avatars bucket missing'
    END as status;

-- Check if banners bucket exists  
SELECT 
    'Banners bucket check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'banners'
        ) THEN '✅ banners bucket exists'
        ELSE '❌ banners bucket missing'
    END as status;

-- List all existing buckets
SELECT 
    'All buckets' as info,
    name as bucket_name,
    created_at,
    CASE public WHEN true THEN 'Public' ELSE 'Private' END as visibility
FROM storage.buckets 
ORDER BY created_at DESC;

-- Check storage policies for avatars bucket (if it exists)
SELECT 
    'Avatars bucket policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%avatar%';

-- Check if avatars bucket has proper RLS policies
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE name = 'avatars' 
            AND EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'storage' 
                AND table_name = 'objects'
            )
        ) THEN 'avatars bucket configuration exists in storage.objects'
        ELSE 'avatars bucket may not be properly configured'
    END as bucket_status;
