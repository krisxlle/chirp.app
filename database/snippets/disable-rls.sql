-- Disable Row Level Security for Development
-- This is a simpler approach for development/testing

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE chirps DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'RLS disabled for development!' as status;
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
