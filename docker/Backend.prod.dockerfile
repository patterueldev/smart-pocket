# Production Dockerfile for Smart Pocket Backend
# Multi-stage build for optimized image size

FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy and build application
COPY . .
RUN npm run build

# Runtime stage
FROM node:24-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env .env.example ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
