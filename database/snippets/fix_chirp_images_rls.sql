-- Fix RLS policies for chirp-images storage bucket
-- This script creates more permissive policies that should work with the current setup

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chirp images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chirp images" ON storage.objects;

-- Create simpler, more permissive policies

-- Policy 1: Allow authenticated users to upload to chirp-images bucket
CREATE POLICY "Allow authenticated uploads to chirp-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chirp-images');

-- Policy 2: Allow anyone to view chirp images (public bucket)
CREATE POLICY "Allow public read access to chirp-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chirp-images');

-- Policy 3: Allow authenticated users to delete from chirp-images bucket
CREATE POLICY "Allow authenticated deletes from chirp-images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'chirp-images');

-- Policy 4: Allow authenticated users to update in chirp-images bucket
CREATE POLICY "Allow authenticated updates to chirp-images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'chirp-images')
WITH CHECK (bucket_id = 'chirp-images');

-- Success message
SELECT 'RLS policies for chirp-images storage updated successfully!' as status;
