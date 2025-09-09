-- Correct SQL syntax for Supabase Storage policies
-- Copy and paste these one at a time in the Supabase Dashboard Policy Editor

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chirp-images')

-- Policy 2: Allow public read access to images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chirp-images')

-- Policy 3: Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'chirp-images')

-- Policy 4: Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'chirp-images')
WITH CHECK (bucket_id = 'chirp-images')
