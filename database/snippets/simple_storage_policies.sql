-- Simple RLS policy fix for chirp-images storage
-- This script only creates policies without modifying the table structure

-- Drop existing policies (these should work even without owner permissions)
DROP POLICY IF EXISTS "Authenticated users can upload chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to chirp-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on chirp-images bucket" ON storage.objects;

-- Create very simple, permissive policies
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

-- Success message
SELECT 'Simple RLS policies created for chirp-images storage!' as status;
