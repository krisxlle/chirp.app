-- Create chirp-images storage bucket and policies
-- This script sets up Supabase Storage for chirp images
-- Note: Some operations may need to be done through the Supabase Dashboard

-- Create the chirp-images bucket
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

-- Note: RLS is typically enabled by default on storage.objects
-- If you need to enable it manually, do so through the Supabase Dashboard

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload chirp images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chirp-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow anyone to view chirp images (public bucket)
CREATE POLICY "Anyone can view chirp images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chirp-images');

-- Policy: Allow users to delete their own images
CREATE POLICY "Users can delete their own chirp images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'chirp-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own images
CREATE POLICY "Users can update their own chirp images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'chirp-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'chirp-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
SELECT 'Chirp images storage bucket and policies created successfully!' as status;
