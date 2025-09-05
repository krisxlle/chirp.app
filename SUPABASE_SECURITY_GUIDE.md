# Supabase Security Configuration Guide

## 🔒 Row Level Security (RLS) Setup

This guide addresses the security warning: **"RLS Disabled in Public"** for the `public.users` table.

### ⚠️ Security Issue
- **Problem**: Row Level Security (RLS) is not enabled on public tables
- **Risk**: Unauthorized access to user data and potential data breaches
- **Solution**: Enable RLS and create appropriate security policies

## 🛠️ Implementation Steps

### 1. Run the Security Script
Execute the `enable-rls-security.sql` script in your Supabase SQL editor:

```sql
-- This script enables RLS and creates security policies
-- Run this in your Supabase dashboard > SQL Editor
```

### 2. Verify RLS is Enabled
Check that RLS is enabled on all tables:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chirps', 'follows');
```

All tables should show `rowsecurity = true`.

## 🔐 Security Policies Explained

### Users Table Policies
- **View All Profiles**: Users can see any profile (needed for profile pages)
- **Update Own Profile**: Users can only modify their own data
- **Insert Own Profile**: Users can create their profile during signup

### Chirps Table Policies
- **View All Chirps**: Users can see all chirps (needed for feeds)
- **Insert Own Chirps**: Users can only post as themselves
- **Update Own Chirps**: Users can only edit their own chirps
- **Delete Own Chirps**: Users can only delete their own chirps

### Follows Table Policies
- **View All Follows**: Users can see follow relationships (for stats)
- **Insert Own Follows**: Users can only follow others as themselves
- **Delete Own Follows**: Users can only unfollow as themselves

## 🚨 Security Best Practices

### 1. Authentication Required
- All policies use `auth.uid()` to verify user identity
- Anonymous users have limited read-only access

### 2. Principle of Least Privilege
- Users can only access/modify their own data
- Public read access limited to necessary data only

### 3. Data Validation
- Policies prevent unauthorized data modification
- User IDs are verified against authenticated user

## 🔍 Testing Security

### Test RLS Policies
```sql
-- Test as authenticated user
SELECT * FROM public.users WHERE id = auth.uid(); -- Should work
SELECT * FROM public.users WHERE id != auth.uid(); -- Should work (view all)

-- Test as anonymous user
SET ROLE anon;
SELECT * FROM public.users; -- Should work (read-only)
INSERT INTO public.users (...) VALUES (...); -- Should fail
```

### Verify Policy Enforcement
```sql
-- Check if policies are working
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.chirps 
WHERE author_id = auth.uid();
```

## 📊 Performance Considerations

### Indexes Created
- `idx_chirps_author_id` - For author-based queries
- `idx_chirps_reply_to_id` - For reply queries
- `idx_chirps_thread_id` - For thread queries
- `idx_follows_follower_id` - For follower queries
- `idx_follows_following_id` - For following queries
- `idx_users_id` - For user lookups

### Query Optimization
- RLS policies use indexes for efficient filtering
- Policies are applied at the database level
- No additional application-level filtering needed

## 🛡️ Additional Security Measures

### 1. API Key Security
- Use environment variables for Supabase keys
- Rotate keys regularly
- Use service role key only server-side

### 2. Storage Security
- Enable RLS on storage buckets
- Set appropriate access policies
- Validate file uploads

### 3. Network Security
- Use HTTPS for all connections
- Implement rate limiting
- Monitor for suspicious activity

## 🔧 Troubleshooting

### Common Issues
1. **"RLS enabled but policies not working"**
   - Check policy syntax
   - Verify user authentication
   - Test with EXPLAIN ANALYZE

2. **"Performance issues after enabling RLS"**
   - Check index usage
   - Optimize policy conditions
   - Monitor query performance

3. **"Anonymous access not working"**
   - Verify anon role permissions
   - Check policy conditions
   - Test with SET ROLE anon

### Debug Commands
```sql
-- Check current user
SELECT auth.uid(), auth.role();

-- Check table permissions
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'users';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📝 Maintenance

### Regular Security Audits
- Review RLS policies monthly
- Test policy enforcement
- Monitor access logs
- Update policies as needed

### Policy Updates
- Document all policy changes
- Test thoroughly before deployment
- Maintain backup of working policies
- Version control policy changes

---

**⚠️ Important**: Always test RLS policies in a development environment before applying to production!
