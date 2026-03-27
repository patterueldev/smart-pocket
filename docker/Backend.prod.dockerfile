# Production Dockerfile for Smart Pocket Backend
# Multi-stage build with nginx reverse proxy for production

FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy and build application
COPY . .
RUN npm run build

# Runtime stage with nginx
FROM node:24-alpine

WORKDIR /app

# Install nginx and supervisor to manage multiple processes
RUN apk add --no-cache nginx supervisor wget

# Copy compiled app and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create nginx configuration directory
RUN mkdir -p /etc/nginx/conf.d

# Configure nginx as reverse proxy for Node.js
RUN printf '%s\n' \
  'server {' \
  '    listen 80 default_server;' \
  '    server_name _;' \
  '    client_max_body_size 10M;' \
  '    ' \
  '    location / {' \
  '        proxy_pass http://localhost:3001;' \
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
  '}' > /etc/nginx/conf.d/default.conf

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
  'command=node dist/index.js' \
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

# Create necessary directories with proper permissions
RUN mkdir -p /var/run/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run/nginx /var/cache/nginx /var/log/nginx

# Expose ports: 80 for nginx (public), 3001 for Node.js (internal)
EXPOSE 80 3001

# Health check via nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start supervisor to manage nginx and Node.js
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
