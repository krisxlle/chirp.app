-- Setup script for Supabase storage buckets
-- This creates the necessary buckets for image uploads if they don't exist

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true, 
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create banners bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'banners', 
    'banners', 
    true, 
    52428800, -- 50MB limit (banners can be larger)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars bucket
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = substring(name, 9, 36) -- Extract UUID from filename like "profile-{uuid}.jpg"
);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = substring(name, 9, 36) -- Extract UUID from filename
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = substring(name, 9, 36) -- Extract UUID from filename
);

-- Create storage policies for banners bucket
-- Allow authenticated users to upload their own banners
CREATE POLICY "Users can upload their own banners" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'banners' 
    AND auth.uid()::text = substring(name, 8, 36) -- Extract UUID from filename like "banner-{uuid}.jpg"
);

-- Allow public read access to banners
CREATE POLICY "Banners are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

-- Allow users to update their own banners
CREATE POLICY "Users can update their own banners" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'banners' 
    AND auth.uid()::text = substring(name, 8, 36) -- Extract UUID from filename
);

-- Allow users to delete their own banners  
CREATE POLICY "Users can delete their own banners" ON storage.objects
FOR DELETE USING (
    bucket_id = 'banners' 
    AND auth.uid()::text = substring(name, 8, 36) -- Extract UUID from filename
);
