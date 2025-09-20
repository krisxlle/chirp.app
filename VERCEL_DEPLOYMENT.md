# Vercel Deployment Guide

## Quick Setup

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository** (`krisxlle/chirp.app`)
5. **Configure the project:**
   - **Framework Preset**: Expo
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
6. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = (your Supabase URL)
   - `SUPABASE_ANON_KEY` = (your Supabase anon key)
   - Any other environment variables from `.env`
7. **Click "Deploy"**

## What Happens

- ✅ **Vercel builds your Expo web app** (`npm run build`)
- ✅ **Serves static files** from `dist/` directory
- ✅ **Routes API calls** to `/api/index.js`
- ✅ **Provides HTTPS** automatically
- ✅ **Custom domain** support

## After Deployment

- **Get your Vercel URL** (e.g., `https://chirp-app.vercel.app`)
- **Test the app** - it should load immediately
- **Configure custom domain** if needed

## Why Vercel Works Better

- ✅ **Built for React/Expo** apps
- ✅ **Automatic HTTPS** and CDN
- ✅ **Serverless functions** for API routes
- ✅ **Zero configuration** needed
- ✅ **Instant deployments** from Git
