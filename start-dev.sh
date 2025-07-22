#!/bin/bash

echo "🚀 Starting Chirp - Original Web Client Interface"
echo "📁 Serving from client/ directory (NOT Expo mobile app)"

# Kill any existing processes on ports 3000 and 5000
pkill -f "vite.*port.*5000" || true
pkill -f "tsx.*server" || true

# Start the backend API server on port 3000
echo "🔧 Starting backend API server..."
npx tsx server/index.ts &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start the original web client using Vite on port 5000
echo "🌐 Starting original React web client..."
cd client && npx vite --port 5000 --host 0.0.0.0 &
CLIENT_PID=$!

echo "✅ Backend API running on http://localhost:3000"
echo "✅ Original web client running on http://localhost:5000"
echo "✅ Using React interface from client/src/App.tsx (NOT Expo app)"

# Keep both processes running
wait $CLIENT_PID $BACKEND_PID