# User Signup Fixes - February 2026

## Problem Summary
Users were unable to post chirps after creating new accounts due to a mismatch between Supabase Auth user IDs and database profile IDs.

## Root Causes Identified

### 1. **Email Confirmation Flow Bug**
- When email confirmation was required, the signup flow would return early
- User profile was never created in the `public.users` table
- User could log in but had no database profile
- Result: "User profile not found" error when trying to post chirps

### 2. **Schema Mismatch**
- Code was trying to insert non-existent columns into the `users` table:
  - `display_name` (doesn't exist in schema)
  - `is_chirp_plus` (doesn't exist in schema)
  - `show_chirp_plus_badge` (doesn't exist in schema)
  - Unnecessary timestamp fields (`created_at`, `updated_at` have defaults)

### 3. **Multiple Signup Flows**
- Web client: `client/src/components/SupabaseAuthContext.tsx`
- API endpoint: `api/auth/signup.js`
- Mobile (lib): `lib/database/mobile-db-supabase.ts`
- Mobile (metro): `metro/lib/database/mobile-db-supabase.ts`
- Email confirmation: `client/src/pages/AuthConfirm.tsx`

All needed to be fixed consistently.

## Actual Database Schema (users table)

```sql
CREATE TABLE "users" (
  "id" varchar PRIMARY KEY NOT NULL,
  "email" varchar UNIQUE,
  "phone" varchar UNIQUE,
  "first_name" varchar,
  "last_name" varchar,
  "profile_image_url" varchar,
  "avatar_url" varchar,
  "banner_image_url" varchar,
  "bio" text,
  "link_in_bio" varchar,
  "interests" text[],
  "handle" varchar NOT NULL UNIQUE,
  "custom_handle" varchar UNIQUE,
  "has_custom_handle" boolean DEFAULT false,
  "link_shares" integer DEFAULT 0,
  "vip_code_used" boolean DEFAULT false,
  "last_ai_generation_date" timestamp,
  "ai_generations_today" integer DEFAULT 0,
  "agreed_to_terms" boolean DEFAULT false,
  "agreed_to_privacy" boolean DEFAULT false,
  "terms_agreed_at" timestamp,
  "privacy_agreed_at" timestamp,
  "weekly_analytics_enabled" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "crystal_balance" integer DEFAULT 500000
);
```

## Fixes Applied

### ✅ 1. Web Client Signup (`client/src/components/SupabaseAuthContext.tsx`)
**Changed:** Profile creation now happens BEFORE checking email confirmation
**Removed:** `display_name`, `profile_image_url`, `banner_image_url`, `created_at`, `updated_at`
**Result:** Profile always gets created, even if email confirmation is pending

### ✅ 2. Email Confirmation Handler (`client/src/pages/AuthConfirm.tsx`)
**Changed:** Removed non-existent columns from profile creation
**Removed:** `profile_image_url`, `banner_image_url`, `created_at`, `updated_at`

### ✅ 3. API Signup Endpoint (`api/auth/signup.js`)
**Changed:** Removed non-existent columns from profile creation
**Removed:** `display_name`, `is_chirp_plus`, `show_chirp_plus_badge`, `created_at`

### ✅ 4. Mobile Signup - Lib (`lib/database/mobile-db-supabase.ts`)
**Changed:** Removed non-existent columns from profile creation
**Removed:** `display_name`, `profile_image_url`, `banner_image_url`, `created_at`, `updated_at`

### ✅ 5. Mobile Signup - Metro (`metro/lib/database/mobile-db-supabase.ts`)
**Changed:** Removed non-existent columns from profile creation
**Removed:** `display_name`, `profile_image_url`, `banner_image_url`, `created_at`, `updated_at`

### ✅ 6. Contacts Integration (`client/src/components/ContactsIntegration.tsx`)
**Fixed:** Added missing `queryFn` to React Query hook

## Correct Profile Insert Format

```javascript
await supabase.from('users').insert({
  id: authData.user.id,           // REQUIRED: Must match Supabase Auth ID
  email: email,                    // User's email
  first_name: name.split(' ')[0],  // First name
  last_name: name.split(' ').slice(1).join(' ') || '', // Last name
  custom_handle: customHandle,     // Custom handle (optional)
  handle: finalHandle,             // REQUIRED: Unique handle
  bio: '',                         // Bio (optional)
  crystal_balance: 100             // Starting crystals
  // created_at and updated_at are auto-set by database defaults
});
```

## Testing Checklist

- [x] Web signup creates profile immediately
- [x] Email confirmation doesn't block profile creation
- [x] Mobile signup creates profile correctly
- [x] API signup endpoint works
- [x] No schema errors during insert
- [x] User can post chirps immediately after signup
- [x] Contacts integration doesn't throw errors

## Future Prevention

1. **Always check database schema** before inserting data
2. **Use TypeScript types** that match the actual database schema
3. **Test the full signup → post chirp flow** after any auth changes
4. **Ensure all signup flows** (web, mobile, API) are consistent

## Manual Fix for Existing Broken Accounts

If a user has a mismatched ID (auth ID ≠ profile ID), run this in browser console:

```javascript
const { supabase } = await import('/src/lib/supabase.ts');
const { data: { user } } = await supabase.auth.getUser();

// Delete old profile
await supabase.from('users').delete().eq('email', user.email);

// Create new profile with correct ID
const handle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
await supabase.from('users').insert({
  id: user.id,
  email: user.email,
  first_name: user.email.split('@')[0],
  last_name: '',
  custom_handle: handle,
  handle: handle,
  bio: 'New to Chirp!',
  crystal_balance: 100
}).select().single();

// Refresh page
location.reload();
```

## Files Modified

1. `client/src/components/SupabaseAuthContext.tsx` - Web signup flow
2. `client/src/pages/AuthConfirm.tsx` - Email confirmation handler
3. `client/src/components/ContactsIntegration.tsx` - React Query fix
4. `api/auth/signup.js` - API signup endpoint
5. `lib/database/mobile-db-supabase.ts` - Mobile signup (lib)
6. `metro/lib/database/mobile-db-supabase.ts` - Mobile signup (metro)

## Impact

✅ **All future users** will be able to post chirps immediately after signup
✅ **No more manual console fixes** needed
✅ **Consistent behavior** across web, mobile, and API
✅ **Email confirmation** no longer blocks profile creation
