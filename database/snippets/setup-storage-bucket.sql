-- Setup Supabase Storage Bucket and Policies
-- Run this in the Supabase SQL Editor

-- Create the assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/*', 'image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']
);

-- Create policy to allow public read access
CREATE POLICY "Public read access for assets" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update their own files
CREATE POLICY "Users can update their own files in assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files in assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);
