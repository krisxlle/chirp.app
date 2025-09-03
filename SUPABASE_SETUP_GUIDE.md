# Supabase Setup Guide

## Step 1: Get Your Correct API Keys

1. Go to https://supabase.com/dashboard
2. Select your project: `qrzbtituxxilnbgocdge`
3. Go to **Settings** → **API**
4. Copy the **anon public** key (starts with `eyJ...`)
5. Copy the **project URL** (should be `https://qrzbtituxxilnbgocdge.supabase.co`)

## Step 2: Update Your Configuration

Replace the values in `mobile-db.ts`:

```typescript
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key-here'; // Replace with the real anon key
```

## Step 3: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase-setup.sql`
3. Click **Run** to execute the script
4. You should see "Database setup completed successfully!"

## Step 4: Test Connection

Run the test script:
```bash
node test-connection.js
```

## Common Issues:

- **Invalid API key**: Make sure you're using the anon key, not the service role key
- **Tables don't exist**: Run the setup SQL script first
- **Network errors**: Check your internet connection and firewall settings

## Expected Output:

```
✅ Basic connection successful
✅ Table 'users' exists and accessible
✅ Table 'chirps' exists and accessible
✅ Table 'follows' exists and accessible
🎉 Supabase connection test completed successfully!
```
