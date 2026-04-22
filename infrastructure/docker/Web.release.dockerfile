# Release Dockerfile for Smart Pocket Web (Experimental Combined Build)
# 
# This is an experimental unified build that serves both backend and frontend
# from a single container using nginx reverse proxy.
# 
# Goals:
# - Single container deployment
# - /api/* routes to backend (Node.js on :3001)
# - /ui/* and /* routes to frontend (nginx static)
# - Shared nginx reverse proxy
#
# Note: This is an experiment. If it doesn't work well, we'll revert to
# separate Backend.release.dockerfile and Frontend.release.dockerfile

FROM node:24-alpine AS backend-builder

WORKDIR /backend

# Install dependencies for backend
COPY apps/smart-pocket-backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy and build backend
COPY apps/smart-pocket-backend . .
RUN npm run build

# ============================================================================

FROM node:24-alpine AS frontend-builder

WORKDIR /frontend

# Install dependencies for frontend
COPY apps/smart-pocket-web/package*.json ./
RUN npm install --legacy-peer-deps

# Copy and build frontend
COPY apps/smart-pocket-web . .
RUN npm run build

# ============================================================================

FROM node:24-alpine

WORKDIR /app

# Install nginx, supervisor, and wget for health checks
RUN apk add --no-cache nginx supervisor wget

# Create necessary directories with proper permissions
RUN mkdir -p /etc/nginx/conf.d /var/run/nginx /var/log/nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run/nginx /var/cache/nginx /var/log/nginx

# ============================================================================
# Backend Setup
# ============================================================================

RUN mkdir -p /app/backend

# Copy compiled backend and dependencies from builder
COPY --from=backend-builder /backend/dist /app/backend/dist
COPY --from=backend-builder /backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /backend/package*.json /app/backend/

# ============================================================================
# Frontend Setup
# ============================================================================

RUN mkdir -p /usr/share/nginx/html

# Copy built frontend
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# ============================================================================
# Nginx Configuration
# ============================================================================

# Configure nginx as reverse proxy:
# - /api/* → Node.js backend on localhost:3001
# - /ui/* → Frontend (SPA static files)
# - /* → Frontend (SPA routing)
RUN printf '%s\n' \
  'server {' \
  '    listen 80 default_server;' \
  '    server_name _;' \
  '    client_max_body_size 10M;' \
  '    ' \
  '    # Backend API routes' \
  '    location ~ ^/api/(.*) {' \
  '        proxy_pass http://localhost:3001/$1;' \
  '        proxy_http_version 1.1;' \
  '        proxy_set_header Upgrade $http_upgrade;' \
  '        proxy_set_header Connection "upgrade";' \
  '        proxy_set_header Host $host;' \
  '        proxy_set_header X-Real-IP $remote_addr;' \
  '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '        proxy_set_header X-Forwarded-Proto $scheme;' \
  '        proxy_cache_bypass $http_upgrade;' \
  '        proxy_connect_timeout 60s;' \
  '        proxy_send_timeout 60s;' \
  '        proxy_read_timeout 60s;' \
  '    }' \
  '    ' \
  '    # Frontend UI routes (can be accessed via /ui or root)' \
  '    location ~ ^/ui/(.*) {' \
  '        alias /usr/share/nginx/html/$1;' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '    ' \
  '    # Static assets (cache with long TTL)' \
  '    location ~ ^/(assets|static)/(.*) {' \
  '        root /usr/share/nginx/html;' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '    ' \
  '    # SPA routing for root path' \
  '    location / {' \
  '        root /usr/share/nginx/html;' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '    ' \
  '    # Never cache index.html' \
  '    location = /index.html {' \
  '        root /usr/share/nginx/html;' \
  '        add_header Cache-Control "no-cache, no-store, must-revalidate";' \
  '    }' \
  '}' > /etc/nginx/conf.d/default.conf

# ============================================================================
# Supervisor Configuration
# ============================================================================

# Create supervisord configuration for managing Node.js and nginx
RUN mkdir -p /etc/supervisor/conf.d
RUN printf '%s\n' \
  '[supervisord]' \
  'nodaemon=true' \
  'user=root' \
  'logfile=/var/log/supervisord.log' \
  'pidfile=/var/run/supervisord.pid' \
  '' \
  '[program:nodejs]' \
  'command=node /app/backend/dist/index.js' \
  'directory=/app/backend' \
  'autostart=true' \
  'autorestart=true' \
  'stderr_logfile=/var/log/nodejs.err.log' \
  'stdout_logfile=/var/log/nodejs.out.log' \
  'environment=NODE_ENV=production' \
  '' \
  '[program:nginx]' \
  'command=/usr/sbin/nginx -g "daemon off;"' \
  'autostart=true' \
  'autorestart=true' \
  'stderr_logfile=/var/log/nginx/error.log' \
  'stdout_logfile=/var/log/nginx/access.log' \
  > /etc/supervisor/conf.d/supervisord.conf

# Expose ports: 80 for nginx (public), 3001 for Node.js (internal only)
EXPOSE 80 3001

# Health check via nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start supervisor to manage both nginx and Node.js
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
