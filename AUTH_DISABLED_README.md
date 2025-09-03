# Authentication Temporarily Disabled for Testing

## What Changed

The authentication system has been temporarily disabled to bypass the login screen for testing purposes. This allows you to directly access the main app functionality without needing to authenticate.

## Files Modified

- `components/AuthContext.tsx` - Modified to automatically authenticate with a mock user

## How It Works

1. **Automatic Authentication**: The app now automatically creates a mock user on startup
2. **Bypassed Login Screen**: The `SignInScreenNew` component is never shown
3. **Mock User Data**: Uses a test user with handle `@testuser`

## Mock User Details

```typescript
{
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  customHandle: 'testuser',
  handle: 'testuser',
  bio: 'This is a test user for development',
  isChirpPlus: false
}
```

## To Re-enable Authentication

1. Open `components/AuthContext.tsx`
2. In the `checkAuthState()` function, comment out the mock user code and uncomment the original authentication logic
3. In the `signIn()` function, comment out the mock user code and uncomment the original authentication logic
4. Remove the warning comment at the top of the file

## Testing Notes

- All app functionality should work normally with the mock user
- User data is not persisted between app restarts (mock user is recreated each time)
- No database connection is required for authentication
- Sign out functionality still works but will be overridden on next app start

## Security Warning

⚠️ **Do not deploy this version to production** - authentication is completely bypassed and any user can access the app without credentials.
