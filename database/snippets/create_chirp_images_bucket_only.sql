-- Alternative: Create chirp-images storage bucket (Dashboard method)
-- If the SQL method fails, use the Supabase Dashboard instead

-- Method 1: Try creating the bucket via SQL
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

-- Success message
SELECT 'Chirp images storage bucket created! Now set up policies in Dashboard.' as status;
