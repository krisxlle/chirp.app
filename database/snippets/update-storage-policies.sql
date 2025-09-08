-- Update Storage Policies to Allow Anonymous Uploads
-- Run this in the Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files in assets" ON storage.objects;

-- Create new policies that allow anonymous access
CREATE POLICY "Public read access for assets" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Allow anonymous uploads to assets bucket
CREATE POLICY "Anonymous upload to assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'assets');

-- Allow anonymous updates to assets bucket
CREATE POLICY "Anonymous update to assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'assets');

-- Allow anonymous deletes to assets bucket
CREATE POLICY "Anonymous delete from assets" ON storage.objects
FOR DELETE USING (bucket_id = 'assets');
