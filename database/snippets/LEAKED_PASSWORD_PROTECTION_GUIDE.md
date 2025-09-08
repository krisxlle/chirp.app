# Supabase Auth Security Configuration Guide

## 🔒 Leaked Password Protection Setup

This guide addresses the security warning: **"Leaked Password Protection Disabled"** in Supabase Auth.

### ⚠️ Security Issue
- **Problem**: Supabase Auth is not checking passwords against HaveIBeenPwned.org
- **Risk**: Users can use compromised passwords from data breaches
- **Solution**: Enable leaked password protection in Supabase Dashboard

## 🛠️ Implementation Steps

### 1. Enable in Supabase Dashboard
**This is the primary solution - must be done in the Supabase Dashboard:**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Settings**

2. **Enable Leaked Password Protection**
   - Find the **"Leaked Password Protection"** setting
   - Toggle it **ON**
   - This will check passwords against HaveIBeenPwned.org database

3. **Configure Additional Settings**
   - Set minimum password length (recommended: 8+ characters)
   - Enable password complexity requirements
   - Configure password history (prevent reuse)

### 2. Run Database Security Script
Execute the `enable-leaked-password-protection.sql` script:

```sql
-- This script sets up additional password security measures
-- Run in Supabase SQL Editor
```

### 3. Test the Protection
Test with a known compromised password:
- Try using common passwords like "password123" or "123456"
- The system should now reject these passwords

## 🔐 Additional Security Measures

### Password Strength Requirements
The SQL script creates a password validation function with these requirements:
- ✅ **Minimum 8 characters**
- ✅ **At least one uppercase letter**
- ✅ **At least one lowercase letter**
- ✅ **At least one digit**
- ✅ **At least one special character**

### Security Best Practices
1. **Enable Multi-Factor Authentication (MFA)**
   - Go to Authentication → Settings
   - Enable MFA for additional security

2. **Configure Rate Limiting**
   - Set up rate limits for login attempts
   - Prevent brute force attacks

3. **Monitor Auth Logs**
   - Regularly check authentication logs
   - Look for suspicious activity patterns

4. **Session Management**
   - Configure session timeouts
   - Enable secure session handling

## 🔍 Verification Steps

### Check Dashboard Settings
1. Go to Supabase Dashboard → Authentication → Settings
2. Verify "Leaked Password Protection" is **enabled**
3. Check that password requirements are configured

### Test Password Protection
```sql
-- Test the password validation function
SELECT public.validate_password_strength('weak123'); -- Should return false
SELECT public.validate_password_strength('StrongP@ss123'); -- Should return true
```

### Monitor Auth Activity
- Check Authentication → Users for any suspicious activity
- Review failed login attempts
- Monitor password reset requests

## 🚨 Troubleshooting

### Common Issues
1. **"Leaked Password Protection" option not visible**
   - Ensure you're using a recent version of Supabase
   - Check if you have the correct permissions

2. **Passwords still being accepted despite protection**
   - Verify the setting is actually enabled
   - Check if there are any bypass mechanisms

3. **False positives with legitimate passwords**
   - Some passwords may be flagged incorrectly
   - Consider adjusting sensitivity settings

### Debug Commands
```sql
-- Check auth configuration
SELECT * FROM auth.users LIMIT 1;

-- Check password policies
SELECT * FROM pg_policies WHERE schemaname = 'auth';
```

## 📊 Security Monitoring

### Regular Audits
- **Weekly**: Check authentication logs
- **Monthly**: Review password policy effectiveness
- **Quarterly**: Full security audit

### Key Metrics to Monitor
- Failed login attempts
- Password reset requests
- Account lockouts
- Suspicious IP addresses

## 🛡️ Additional Recommendations

### 1. User Education
- Inform users about password requirements
- Provide password strength indicators
- Offer password manager recommendations

### 2. Progressive Security
- Start with basic protection
- Gradually increase security requirements
- Monitor user adoption and feedback

### 3. Backup Authentication
- Implement alternative authentication methods
- Consider social login options
- Plan for account recovery scenarios

## 📝 Configuration Checklist

- [ ] Enable leaked password protection in Supabase Dashboard
- [ ] Set minimum password length (8+ characters)
- [ ] Configure password complexity requirements
- [ ] Enable multi-factor authentication
- [ ] Set up rate limiting
- [ ] Configure session timeouts
- [ ] Test with known compromised passwords
- [ ] Monitor authentication logs
- [ ] Document security policies
- [ ] Train team on security procedures

---

**⚠️ Important**: The primary fix must be done in the Supabase Dashboard. The SQL script provides additional security measures but cannot enable the leaked password protection feature itself.
