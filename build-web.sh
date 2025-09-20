#!/bin/bash

# Build script that temporarily moves server files to avoid Metro bundling issues

echo "🚀 Starting web build process..."

# Create temporary directory for server files
mkdir -p .temp-server-backup

# Move server files temporarily
echo "📁 Moving server files temporarily..."
mv server .temp-server-backup/
mv services .temp-server-backup/
mv utils .temp-server-backup/
mv scripts .temp-server-backup/
mv docs .temp-server-backup/
mv database .temp-server-backup/
mv monetization .temp-server-backup/
mv lib .temp-server-backup/
mv shared .temp-server-backup/
mv types .temp-server-backup/

# Run the build
echo "🔨 Running Expo build..."
EXPO_WEB_ENTRY=web-entry.js expo export --platform web --clear

# Restore server files
echo "📁 Restoring server files..."
mv .temp-server-backup/* ./
rmdir .temp-server-backup

echo "✅ Build completed!"
