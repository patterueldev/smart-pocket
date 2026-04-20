# Development Dockerfile for Smart Pocket Web Environment
# Runs three services in one container: nginx + backend (nodemon) + frontend (Vite)
# Supports hot reload for both backend and frontend via volume mounts

FROM node:24-alpine

WORKDIR /app

# Install nginx and supervisor for process management
RUN apk add --no-cache nginx supervisor

# Create necessary directories
RUN mkdir -p /app/backend /app/frontend /var/log/supervisor

# ============================================================
# Copy Backend Application
# ============================================================
COPY apps/smart-pocket-backend/package*.json /app/backend/
COPY apps/smart-pocket-backend/tsconfig.json /app/backend/
COPY apps/smart-pocket-backend/tsconfig.test.json /app/backend/
COPY apps/smart-pocket-backend/.prettierignore /app/backend/
COPY apps/smart-pocket-backend/.prettierrc.json /app/backend/
COPY apps/smart-pocket-backend/eslint.config.mjs /app/backend/
COPY apps/smart-pocket-backend/jest.config.js /app/backend/
COPY apps/smart-pocket-backend/src /app/backend/src
COPY apps/smart-pocket-backend/__tests__ /app/backend/__tests__

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# ============================================================
# Copy Frontend Application
# ============================================================
WORKDIR /app
COPY apps/smart-pocket-web/package*.json /app/frontend/
COPY apps/smart-pocket-web/tsconfig*.json /app/frontend/
COPY apps/smart-pocket-web/.eslintrc.json /app/frontend/
COPY apps/smart-pocket-web/.prettierrc /app/frontend/
COPY apps/smart-pocket-web/vite.config.ts /app/frontend/
COPY apps/smart-pocket-web/jest.config.cjs /app/frontend/
COPY apps/smart-pocket-web/index.html /app/frontend/
COPY apps/smart-pocket-web/src /app/frontend/src
COPY apps/smart-pocket-web/public /app/frontend/public

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# ============================================================
# Configure Nginx
# ============================================================
WORKDIR /app

# Copy nginx main config
COPY infrastructure/nginx-dev/nginx.conf /etc/nginx/nginx.conf

# Copy nginx server configuration
RUN mkdir -p /etc/nginx/conf.d
COPY infrastructure/nginx-dev/conf.d/server.conf /etc/nginx/conf.d/server.conf

# Create nginx user if it doesn't exist
RUN addgroup -S nginx 2>/dev/null || true && \
    adduser -S -G nginx nginx 2>/dev/null || true

# ============================================================
# Configure Supervisor
# ============================================================
# Create supervisor configuration directory
RUN mkdir -p /etc/supervisor/conf.d

# Create supervisor main configuration
RUN cat > /etc/supervisor/supervisord.conf <<'EOF'
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
childlogdir=/var/log/supervisor

[include]
files=/etc/supervisor/conf.d/*.conf
EOF

# Create supervisor program configurations
RUN cat > /etc/supervisor/conf.d/nginx.conf <<'EOF'
[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=10
EOF

RUN cat > /etc/supervisor/conf.d/backend.conf <<'EOF'
[program:backend]
directory=/app/backend
command=npm run dev
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=20
environment=NODE_ENV=development
EOF

RUN cat > /etc/supervisor/conf.d/frontend.conf <<'EOF'
[program:frontend]
directory=/app/frontend
command=/bin/sh -c "VITE_BASE_URL=/ui/ npm run dev"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=30
EOF

# ============================================================
# Expose Port
# ============================================================
EXPOSE 80

# ============================================================
# Start Services
# ============================================================
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
