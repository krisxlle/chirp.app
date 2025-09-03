# How to Get Your Supabase Anon Key

## Step 1: Access Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in with your account
3. Select your project: `qrzbtituxxilnbgocdge`

## Step 2: Find Your API Keys

1. In the left sidebar, click **Settings**
2. Click **API**
3. You'll see two keys:
   - **Project URL**: `https://qrzbtituxxilnbgocdge.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (this is what you need)

## Step 3: Copy the Correct Key

- ✅ **Use the "anon public" key** (starts with `eyJ...`)
- ❌ **Don't use the "service_role" key** (starts with `eyJ...` but has different permissions)

## Step 4: Update Your Code

Replace the anon key in `mobile-db.ts`:

```typescript
const SUPABASE_ANON_KEY = 'your-actual-anon-key-from-dashboard';
```

## Step 5: Test Again

Run the test script:
```bash
node test-connection.js
```

## Visual Guide:

```
Settings → API
├── Project URL: https://qrzbtituxxilnbgocdge.supabase.co
├── anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← COPY THIS
└── service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← DON'T COPY THIS
```
