# Database Connection Guide for Chirp Mobile App

## Overview

Your Chirp app uses **Neon Database** (PostgreSQL serverless) with a proper backend API architecture. This guide explains how to set up and connect to your database.

## Architecture

```
Mobile App (React Native/Expo) 
    ↓ API Calls
Backend Server (Express.js + TypeScript)
    ↓ Database Connection
Neon Database (PostgreSQL)
```

## Current Setup

### 1. Database: Neon Database
- **Type**: PostgreSQL serverless
- **Package**: `@neondatabase/serverless`
- **Connection**: Server-side only (secure)

### 2. Backend Server
- **Framework**: Express.js with TypeScript
- **Location**: `server/index.ts`
- **Database Connection**: `server/db.ts`
- **API Routes**: `server/routes.ts`

### 3. Mobile App
- **Framework**: React Native with Expo
- **API Client**: `mobile-api.ts` (new)
- **Authentication**: `components/AuthContext.tsx`

## Setup Instructions

### Step 1: Set Environment Variables

Create a `.env` file in your project root:

```bash
# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_vLmUtE3gZ8Ck@ep-flat-river-afy8pigw.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: API URL for mobile app
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### Step 2: Start the Backend Server

```bash
# Make the script executable
chmod +x start-backend.sh

# Start the server
./start-backend.sh
```

Or manually:

```bash
# Set environment variables
export DATABASE_URL="your-neon-database-url"
export PORT=5000

# Start the server
npx tsx server/index.ts
```

### Step 3: Test the API

The server will be available at `http://localhost:5000`

Test endpoints:
- `GET http://localhost:5000/api/chirps` - Get chirps
- `POST http://localhost:5000/api/chirps` - Create chirp
- `GET http://localhost:5000/api/users/:id` - Get user

### Step 4: Update Mobile App Configuration

In your mobile app, set the API URL:

```bash
# For development
export EXPO_PUBLIC_API_URL=http://localhost:5000

# For production (replace with your actual domain)
export EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

## API Endpoints Available

Your backend already has these endpoints:

### Chirps
- `GET /api/chirps` - Get chirps (with feed type)
- `POST /api/chirps` - Create chirp
- `DELETE /api/chirps/:id` - Delete chirp
- `GET /api/chirps/:id/replies` - Get replies
- `POST /api/chirps/:id/repost` - Repost chirp

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/chirps` - Get user's chirps
- `GET /api/users/:id/stats` - Get user stats

### Social Features
- `POST /api/follows` - Follow user
- `DELETE /api/follows/:id` - Unfollow user
- `POST /api/reactions` - Add reaction
- `DELETE /api/reactions/:id` - Remove reaction

### Search
- `GET /api/search/chirps` - Search chirps
- `GET /api/search/users` - Search users
- `GET /api/hashtags/:hashtag/chirps` - Get chirps by hashtag

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

## Troubleshooting

### White Screen Issue
The white screen was caused by direct database connection from the frontend. This is now fixed by:
1. Using the backend API instead of direct database calls
2. Proper error handling in the API client
3. Fallback to mock data if API is unavailable

### Database Connection Issues
1. **Check DATABASE_URL**: Ensure it's correctly set
2. **Network Access**: Ensure your server can reach Neon database
3. **SSL Mode**: Neon requires SSL (`?sslmode=require`)

### API Connection Issues
1. **Server Running**: Ensure backend server is started
2. **Port Available**: Check if port 5000 is free
3. **CORS**: Backend should handle CORS for mobile app

### Mobile App Issues
1. **API URL**: Check `EXPO_PUBLIC_API_URL` environment variable
2. **Network**: Ensure mobile app can reach the API
3. **Authentication**: Check if auth tokens are being sent

## Development vs Production

### Development
- Backend: `http://localhost:5000`
- Database: Neon (same)
- Mobile: Expo development server

### Production
- Backend: Your deployed server (e.g., Vercel, Railway, etc.)
- Database: Neon (same)
- Mobile: Built app with production API URL

## Security Notes

✅ **Good Practices**:
- Database credentials only on server
- API authentication middleware
- Input validation with Zod
- Rate limiting (can be added)

⚠️ **To Add**:
- JWT tokens for mobile auth
- API rate limiting
- Request logging
- Error monitoring

## Next Steps

1. **Start the backend server** using the script
2. **Test the API** with curl or Postman
3. **Update mobile app** to use the API
4. **Deploy backend** to production
5. **Update mobile app** with production API URL

The white screen issue should now be resolved, and your app will properly connect to your Neon database through the secure backend API!
