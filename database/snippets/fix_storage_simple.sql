-- Simple fix for Supabase Storage RLS policies
-- This removes all existing policies and creates very permissive ones

-- Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Allow authenticated uploads to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_upload" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_select" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_update" ON storage.objects;

-- Create very simple, permissive policies
CREATE POLICY "Allow all authenticated operations on chirp-images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'chirp-images')
WITH CHECK (bucket_id = 'chirp-images');

-- Allow public read access
CREATE POLICY "Allow public read access to chirp-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chirp-images');

-- Verify policies
SELECT policyname, cmd, roles, permissive, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
