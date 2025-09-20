# Netlify Deployment Guide

## Quick Setup

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign in with GitHub**
3. **Click "New site from Git"**
4. **Choose your repository** (`krisxlle/chirp.app`)
5. **Configure build settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`
6. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = (your Supabase URL)
   - `SUPABASE_ANON_KEY` = (your Supabase anon key)
7. **Click "Deploy site"**

## What Happens

- ✅ **Netlify builds** your Expo web app (`npm run build`)
- ✅ **Serves static files** from `dist/` directory
- ✅ **Routes API calls** to `/api/index.js`
- ✅ **Provides HTTPS** automatically
- ✅ **Custom domain** support

## After Deployment

- **Get your Netlify URL** (e.g., `https://chirp-app.netlify.app`)
- **Test the app** - it should load immediately
- **Configure custom domain** if needed

## Why Netlify Might Work Better

- ✅ **Better static site handling** than Vercel
- ✅ **Simpler build process** - less complex than Vercel
- ✅ **Automatic HTTPS** and CDN
- ✅ **Easy environment variable** management
- ✅ **Instant deployments** from Git
