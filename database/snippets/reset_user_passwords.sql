-- Reset User Passwords for Migrated Accounts
-- This script helps users reset their passwords after migration

-- Step 1: Check which users need password reset
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.handle,
    au.email_confirmed_at,
    au.created_at as auth_created_at
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at;

-- Step 2: Create a function to reset a user's password
CREATE OR REPLACE FUNCTION reset_user_password(
    user_email TEXT,
    new_password TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Find the user in Supabase Auth
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found in Supabase Auth';
        RETURN;
    END IF;
    
    -- Update the password
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = auth_user_id;
    
    RETURN QUERY SELECT TRUE, 'Password updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Reset password for a specific user (replace with actual email)
-- Example: SELECT * FROM reset_user_password('user@example.com', 'newpassword123');

-- Step 4: Create a function to send password reset emails
CREATE OR REPLACE FUNCTION send_password_reset_email(user_email TEXT)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    auth_user_id UUID;
    reset_token TEXT;
BEGIN
    -- Find the user in Supabase Auth
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found in Supabase Auth';
        RETURN;
    END IF;
    
    -- Generate a reset token
    reset_token := encode(gen_random_bytes(32), 'base64');
    
    -- Update the user with the reset token
    UPDATE auth.users
    SET 
        recovery_token = reset_token,
        updated_at = NOW()
    WHERE id = auth_user_id;
    
    -- In a real implementation, you would send an email here
    -- For now, we'll just return the token (remove this in production!)
    RETURN QUERY SELECT TRUE, 'Reset token generated: ' || reset_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Instructions for users
SELECT 
    'Password Reset Instructions' as title,
    '1. Users need to use "Forgot Password" feature' as step1,
    '2. Or contact admin to reset password manually' as step2,
    '3. Default password for migrated users is: password123' as step3,
    '4. Users should change password after first login' as step4;

-- Step 6: Show users who might need password reset
SELECT 
    'Users who may need password reset' as info,
    COUNT(*) as user_count
FROM public.users u
JOIN auth.users au ON u.email = au.email
WHERE au.email_confirmed_at IS NOT NULL;

-- Step 7: Clean up functions
DROP FUNCTION IF EXISTS reset_user_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS send_password_reset_email(TEXT);

-- Success message
SELECT 'Password reset utilities created!' as status;

