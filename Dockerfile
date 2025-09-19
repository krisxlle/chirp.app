# Multi-stage Dockerfile for Chirp Production Deployment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chirp -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies including tsx for TypeScript execution
RUN npm ci --only=production && npm install tsx && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=chirp:nodejs /app/dist ./dist
COPY --from=builder --chown=chirp:nodejs /app/server ./server
COPY --from=builder --chown=chirp:nodejs /app/shared ./shared
COPY --from=builder --chown=chirp:nodejs /app/lib ./lib
COPY --from=builder --chown=chirp:nodejs /app/services ./services
COPY --from=builder --chown=chirp:nodejs /app/utils ./utils

# Switch to non-root user
USER chirp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with debug logging
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "echo 'Starting Chirp server...' && echo 'NODE_ENV:' $NODE_ENV && echo 'PORT:' $PORT && ls -la /app/server && npx tsx server/index.ts"]
