-- Fix 400 Bad Request error for chirp-images storage
-- This script creates the bucket and sets up proper policies

-- First, create the chirp-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chirp-images',
  'chirp-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can upload chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on chirp-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_upload" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_select" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "chirp_images_update" ON storage.objects;

-- Create simple, permissive policies for chirp-images
CREATE POLICY "chirp_images_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chirp-images');

CREATE POLICY "chirp_images_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chirp-images');

CREATE POLICY "chirp_images_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'chirp-images');

CREATE POLICY "chirp_images_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'chirp-images')
WITH CHECK (bucket_id = 'chirp-images');

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'chirp-images';

-- Verify policies were created
SELECT policyname, cmd, roles, permissive, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' 
AND policyname LIKE '%chirp_images%';

-- Success message
SELECT 'Chirp images bucket and policies created successfully!' as status;
