# Database Schema Fix Guide

## Problem Identified
The error "Could not find the 'type' column of 'reactions' in the schema cache" indicates that:
1. The database schema is out of sync with the code
2. The database connection is not properly configured
3. The reactions table might be missing or have incorrect structure

## Solution Steps

### Step 1: Set Up Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Development Security Configuration
COMPUTER_IP=192.168.1.194

# Database Configuration
# Replace [YOUR_PASSWORD] with your actual Supabase database password
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.qrzbtituxxilnbgocdge.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://qrzbtituxxilnbgocdge.supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# Development Environment
NODE_ENV=development
PORT=5000
```

### Step 2: Get Your Database Credentials
1. Go to https://supabase.com/dashboard
2. Select your project: `qrzbtituxxilnbgocdge`
3. Go to **Settings** → **Database**
4. Copy the **Database password**
5. Go to **Settings** → **API**
6. Copy the **anon public** key

### Step 3: Update Your .env.local File
Replace `[YOUR_PASSWORD]` and `[YOUR_ANON_KEY]` with the actual values from your Supabase dashboard.

### Step 4: Push Database Schema
Run this command to sync your database schema:
```bash
npx drizzle-kit push
```

### Step 5: Test Database Connection
Run the test script:
```bash
node test-connection.js
```

## Expected Results
After completing these steps:
- ✅ Database schema will be in sync
- ✅ Reactions table will have correct structure
- ✅ Like functionality will work properly
- ✅ iOS bundling will stop happening due to errors

## Troubleshooting
If you still get errors:
1. Check that your `.env.local` file has the correct database URL
2. Verify your Supabase project is active
3. Make sure you're using the correct database password
4. Try running `npx drizzle-kit push` again

## Database Schema
The reactions table should have these columns:
- `id` (serial primary key)
- `user_id` (varchar, references users.id)
- `chirp_id` (integer, references chirps.id)
- `emoji` (varchar(10))
- `created_at` (timestamp)

The `type` column belongs to the `notifications` table, not the `reactions` table.
