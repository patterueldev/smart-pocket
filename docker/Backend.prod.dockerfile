# Production Dockerfile for Smart Pocket unified web + API deployment
# Builds:
# - React web app from apps/smart-pocket-mobile
# - Node API from apps/smart-pocket-backend
# Serves web at "/" and API at "/api" via nginx reverse proxy.

FROM node:24-bookworm-slim AS backend-builder

WORKDIR /workspace/apps/smart-pocket-backend
COPY apps/smart-pocket-backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY apps/smart-pocket-backend/ ./
RUN npm run build

FROM node:24-bookworm-slim AS frontend-builder

# Build-time environment selection for Expo config (valid: dev, qa, prod)
ARG APP_ENV=prod
# Feature flag passed to web build to enable real sheets-sync integration
ARG USE_REAL_SHEETS_SYNC=true
ENV APP_ENV=${APP_ENV}
ENV USE_REAL_SHEETS_SYNC=${USE_REAL_SHEETS_SYNC}

WORKDIR /workspace/apps/smart-pocket-mobile
COPY apps/smart-pocket-mobile/package*.json ./
RUN npm ci
COPY apps/smart-pocket-mobile/ ./
RUN npx expo export --platform web

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

# Install nginx and supervisor to run web server + backend process
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor wget && \
    rm -rf /var/lib/apt/lists/*

# Reuse backend dependencies from build stage and prune dev deps
COPY apps/smart-pocket-backend/package*.json ./
COPY --from=backend-builder /workspace/apps/smart-pocket-backend/node_modules ./node_modules
RUN npm prune --omit=dev

# Copy compiled backend and generated web bundle
COPY --from=backend-builder /workspace/apps/smart-pocket-backend/dist ./dist
COPY --from=frontend-builder /workspace/apps/smart-pocket-mobile/dist /usr/share/nginx/html

# Create nginx directories
RUN mkdir -p /etc/nginx/conf.d /var/run/nginx /var/log/nginx /var/cache/nginx
RUN rm -f /etc/nginx/sites-enabled/default

# Nginx config:
# - Serve SPA from root
# - Proxy /api/* -> backend on port 3001
RUN printf '%s\n' \
  'server {' \
  '    listen 80 default_server;' \
  '    server_name _;' \
  '    client_max_body_size 10M;' \
  '' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '' \
  '    location = /api {' \
  '        return 308 /api/;' \
  '    }' \
  '' \
  '    location /api/ {' \
  '        proxy_pass http://127.0.0.1:3001/;' \
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
  '' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '}' > /etc/nginx/conf.d/default.conf

# Supervisord config for nginx + backend process
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
  'environment=NODE_ENV="production",PORT="3001"' \
  '' \
  '[program:nginx]' \
  'command=/usr/sbin/nginx -g "daemon off;"' \
  'autostart=true' \
  'autorestart=true' \
  'stderr_logfile=/var/log/nginx/error.log' \
  'stdout_logfile=/var/log/nginx/access.log' \
  > /etc/supervisor/conf.d/supervisord.conf

# Public entrypoint is nginx
EXPOSE 80

# Health check through nginx + /api route
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/api/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
