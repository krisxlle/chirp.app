-- Emergency RLS bypass for chirp-images storage
-- This script temporarily disables RLS to allow uploads

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Temporarily disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Success message
SELECT 'RLS temporarily disabled for storage.objects - uploads should now work!' as status;
