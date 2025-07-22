#!/bin/bash

# Build script for Expo web deployment
echo "🚀 Starting Expo web build..."

# Build the web application using Expo
expo export --platform web

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Expo web build completed successfully"
    
    # Ensure the dist directory has the correct structure for deployment
    if [ -d "dist" ]; then
        # Copy index.html to root of dist if it doesn't exist
        if [ ! -f "dist/index.html" ] && [ -f "dist/public/index.html" ]; then
            cp dist/public/index.html dist/index.html
            echo "✅ Copied index.html to dist root"
        fi
        
        # Copy other assets from public to dist root if needed
        if [ -d "dist/public" ]; then
            cp -r dist/public/* dist/ 2>/dev/null || true
            echo "✅ Assets copied to dist root"
        fi
    fi
    
    echo "🎉 Build ready for deployment!"
else
    echo "❌ Expo web build failed"
    exit 1
fi