#!/bin/bash

# Production Deployment Script for Chirp Web App
# This script builds and prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting production deployment for Chirp..."

# Check if required environment variables are set
if [ -z "$PRODUCTION_DOMAIN" ]; then
    echo "❌ Error: PRODUCTION_DOMAIN environment variable is required"
    echo "Please set PRODUCTION_DOMAIN to your domain (e.g., yourdomain.com)"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is required"
    echo "Please set DATABASE_URL to your Supabase database URL"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "❌ Error: SESSION_SECRET environment variable is required"
    echo "Please set SESSION_SECRET to a secure random string"
    exit 1
fi

echo "✅ Environment variables validated"

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the web application
echo "🔨 Building web application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Web build completed successfully"
else
    echo "❌ Web build failed"
    exit 1
fi

# Create production directory structure
echo "📁 Setting up production directory..."
mkdir -p dist/public

# Copy built files to production directory
if [ -d "dist" ]; then
    # Copy all built files
    cp -r dist/* dist/public/ 2>/dev/null || true
    
    # Ensure index.html is in the right place
    if [ ! -f "dist/public/index.html" ] && [ -f "dist/index.html" ]; then
        cp dist/index.html dist/public/index.html
    fi
    
    echo "✅ Production files prepared"
else
    echo "❌ Build directory not found"
    exit 1
fi

# Create production startup script
cat > dist/start-production.sh << 'EOF'
#!/bin/bash
# Production startup script

# Set production environment
export NODE_ENV=production

# Start the server
echo "🚀 Starting Chirp production server..."
node server/index.js
EOF

chmod +x dist/start-production.sh

# Create production package.json
cat > dist/package.json << EOF
{
  "name": "chirp-production",
  "version": "1.0.0",
  "description": "Chirp Social Media App - Production Build",
  "main": "server/index.js",
  "scripts": {
    "start": "./start-production.sh",
    "start:node": "node server/index.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "express-session": "^1.18.2",
    "connect-pg-simple": "^10.0.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "bcryptjs": "^3.0.2",
    "csrf": "^3.1.0",
    "express-rate-limit": "^8.1.0",
    "pg": "^8.16.3",
    "@supabase/supabase-js": "^2.57.0",
    "openai": "^5.10.2",
    "nodemailer": "^7.0.5",
    "node-cron": "^4.2.1",
    "jose": "^6.0.12"
  }
}
EOF

# Copy server files to production directory
echo "📋 Copying server files..."
cp -r server dist/
cp -r shared dist/
cp -r lib dist/
cp -r services dist/
cp -r utils dist/
cp package.json dist/
cp tsconfig.json dist/

# Create production README
cat > dist/README.md << EOF
# Chirp Production Deployment

This is the production build of Chirp social media application.

## Environment Variables Required

Make sure to set the following environment variables:

- \`NODE_ENV=production\`
- \`PORT=5000\` (or your preferred port)
- \`PRODUCTION_DOMAIN=yourdomain.com\`
- \`DATABASE_URL=your_supabase_database_url\`
- \`SESSION_SECRET=your_secure_session_secret\`
- \`EXPO_PUBLIC_SUPABASE_URL=your_supabase_url\`
- \`EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\`

## Starting the Application

\`\`\`bash
npm start
\`\`\`

Or directly with Node.js:

\`\`\`bash
node server/index.js
\`\`\`

## Security Notes

- Ensure HTTPS is enabled on your domain
- Set up proper SSL certificates
- Configure firewall rules to only allow necessary ports
- Regularly update dependencies
- Monitor logs for suspicious activity

## Domain Configuration

The application is configured for domain: $PRODUCTION_DOMAIN

Make sure your domain's DNS points to this server and SSL is properly configured.
EOF

echo "🎉 Production deployment ready!"
echo "📁 Files are in the 'dist' directory"
echo "🌐 Configure your domain: $PRODUCTION_DOMAIN"
echo "🔒 Remember to set up HTTPS and SSL certificates"
echo ""
echo "To start the production server:"
echo "  cd dist && npm start"
