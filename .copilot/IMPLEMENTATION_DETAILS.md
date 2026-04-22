# Web.dev.dockerfile Implementation Details

## File Structure

```
infrastructure/
├── docker/
│   ├── Web.dev.dockerfile          ✅ NEW - Multi-service dev container
│   ├── WEB_DEV_DOCKERFILE.md        ✅ NEW - Complete documentation
│   ├── Backend.dev.dockerfile       (existing - single service)
│   ├── Backend.prod.dockerfile      (existing - production)
│   ├── Backend.test.dockerfile      (existing - testing)
│   └── DOCKER_GUIDE.md              (existing - Docker reference)
└── nginx-dev/
    ├── nginx.conf                   (used by Web.dev.dockerfile)
    └── conf.d/
        └── server.conf              (used by Web.dev.dockerfile)
```

## Supervisor Configuration (inside container)

The dockerfile creates three supervisor configuration files:

### 1. Main Configuration: `/etc/supervisor/supervisord.conf`
```ini
[supervisord]
nodaemon=true                              # Required for Docker
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
childlogdir=/var/log/supervisor

[include]
files=/etc/supervisor/conf.d/*.conf        # Auto-load all program configs
```

### 2. nginx Program: `/etc/supervisor/conf.d/nginx.conf`
```ini
[program:nginx]
command=nginx -g "daemon off;"             # Run in foreground
autostart=true                             # Start automatically
autorestart=true                           # Restart if crashes
stdout_logfile=/dev/stdout                 # Docker-friendly logging
stdout_logfile_maxbytes=0                  # No log rotation
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=10                                # Starts first
```

### 3. Backend Program: `/etc/supervisor/conf.d/backend.conf`
```ini
[program:backend]
directory=/app/backend                     # Working directory
command=npm run dev                        # Runs: nodemon with ts-node
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=20                                # Starts after nginx
environment=NODE_ENV=development
```

### 4. Frontend Program: `/etc/supervisor/conf.d/frontend.conf`
```ini
[program:frontend]
directory=/app/frontend                    # Working directory
command=npm run dev                        # Runs: vite dev server
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
priority=30                                # Starts last
environment=VITE_API_URL=http://localhost/api
```

## Execution Flow Inside Container

1. **Entry Point** (CMD): `supervisord -c /etc/supervisor/supervisord.conf`

2. **Supervisor Starts** (pid 1):
   - Reads main supervisord.conf
   - Includes all files from `/etc/supervisor/conf.d/`
   - Starts processes in priority order (10, 20, 30)

3. **nginx Starts** (priority 10):
   - Command: `nginx -g "daemon off;"`
   - Binds to port 80
   - Reads config from `/etc/nginx/nginx.conf`
   - Upstream targets: localhost:3000 (backend), localhost:5173 (frontend)

4. **Backend Starts** (priority 20):
   - Command: `npm run dev`
   - Runs: `nodemon --watch src --ext ts --legacy-watch --exec ts-node src/index.ts`
   - Binds to port 3000
   - Watches `/app/backend/src` for changes
   - Accessible to nginx at localhost:3000

5. **Frontend Starts** (priority 30):
   - Command: `npm run dev`
   - Runs: Vite dev server
   - Binds to port 5173 (localhost)
   - Watches `/app/frontend/src` for changes
   - HMR WebSocket at localhost:5173/@vite/ws

## Request Flow Through nginx

```
Client Request to http://localhost/ui/app

1. nginx listens on port 80
2. Matches location /ui/
3. Proxies to http://frontend/ (localhost:5173)
4. Sets proxy headers:
   - Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto
   - Connection: "" (keep-alive)
5. Vite handles request, returns HTML/assets
6. Browser loads assets (CSS, JS, etc.)
7. Vite HMR connects to ws://localhost/@vite/ws
8. Hot module replacement works on file changes
```

## Hot Reload Implementation

### Backend Hot Reload (nodemon)

```bash
# Inside container: /app/backend
npm run dev

# Expands to:
# nodemon --watch src --ext ts --legacy-watch --exec ts-node src/index.ts

# Volume mount: ./apps/smart-pocket-backend/src:/app/backend/src
# When host file changes → container sees change → nodemon restarts → new server
```

**Process**:
1. File modified on host (e.g., `apps/smart-pocket-backend/src/app.ts`)
2. Change synced to container via volume mount
3. nodemon detects change (watching `/app/backend/src`)
4. Stops current process
5. Restarts TypeScript compilation via ts-node
6. New server starts
7. Requests to http://localhost/api/* go to new server

**Time to reload**: ~2-3 seconds

### Frontend Hot Reload (Vite HMR)

```bash
# Inside container: /app/frontend
npm run dev

# Runs Vite dev server on localhost:5173
# Watches /app/frontend/src for changes
# WebSocket HMR connection at /@vite/ws

# Volume mount: ./apps/smart-pocket-web/src:/app/frontend/src
# When host file changes → container sees change → Vite recompiles → HMR sent over WS
```

**Process**:
1. File modified on host (e.g., `apps/smart-pocket-web/src/App.tsx`)
2. Change synced to container via volume mount
3. Vite detects change (watching `/app/frontend/src`)
4. Recompiles changed module
5. Sends HMR message over WebSocket to browser
6. Browser updates module in place
7. React component updates without full page reload

**Time to reload**: ~100-500ms (depending on file size)

## Docker Build Stages

The Dockerfile optimizes Docker layer caching:

1. **Stage 1-2**: Base image setup
   - FROM node:24-alpine
   - Install nginx, supervisor
   - Create directories

2. **Stage 3-7**: Backend application
   - Copy backend package.json, configs
   - Install dependencies
   - Copy source code

3. **Stage 8-14**: Frontend application
   - Copy frontend package.json, configs
   - Install dependencies
   - Copy source code

4. **Stage 15-26**: Nginx configuration
   - Copy nginx configs
   - Create nginx user
   - Validate configuration

5. **Stage 27-37**: Supervisor setup
   - Create supervisor configs
   - Configure program definitions
   - Set EXPOSE and CMD

**Caching Strategy**:
- package*.json copied first (cached, only invalidated on dependency changes)
- Configuration files copied second (cached, only invalidated on config changes)
- Source code copied last (not cached, invalidates on any source change)
- This allows fast rebuilds when only source changes

## Environment Variables

Set inside the Dockerfile at build time:

**Backend**:
- `NODE_ENV=development` (set in supervisor program config)

**Frontend**:
- `VITE_API_URL=http://localhost/api` (set in supervisor program config)

Both can be overridden at runtime:
```bash
docker run -e NODE_ENV=production -e VITE_API_URL=http://api.example.com ...
```

## Network Configuration (Inside Container)

```
127.0.0.1 (localhost inside container)

Services:
- nginx       :80
- backend     :3000
- frontend    :5173

nginx upstream definitions (from nginx.conf):
- upstream backend { server localhost:3000; }
- upstream frontend { server localhost:5173; }

All communication via localhost loopback (no network calls outside container)
```

## Log Output Structure

All services log to stdout/stderr, visible via `docker logs`:

```
[2025-04-19 10:00:00] supervisord started
[2025-04-19 10:00:01] nginx started (pid: 10)
[2025-04-19 10:00:02] backend started (pid: 42)
[2025-04-19 10:00:02] ts-node transpiling /app/backend/src/index.ts
[2025-04-19 10:00:02] Backend listening on port 3000
[2025-04-19 10:00:03] frontend started (pid: 43)
[2025-04-19 10:00:03] VITE v5.x.x  ready in 150ms
[2025-04-19 10:00:03] ➜ Local: http://localhost:5173/
[2025-04-19 10:00:04] > GET /api/health HTTP/1.1 200 OK (1.2ms)
```

## Troubleshooting Guide

### Check Service Status
```bash
docker exec <container-id> supervisorctl status
```

Expected:
```
backend                          RUNNING   pid 42, uptime 0:05:30
frontend                         RUNNING   pid 43, uptime 0:05:25
nginx                            RUNNING   pid 10, uptime 0:05:35
```

### Service not running?

1. Check logs:
   ```bash
   docker logs <container-id> | grep "backend\|frontend\|nginx"
   ```

2. Check supervisor state:
   ```bash
   docker exec <container-id> supervisorctl status <program-name>
   ```

3. Check process details:
   ```bash
   docker exec <container-id> supervisorctl tail <program-name>
   ```

4. Manually start service:
   ```bash
   docker exec <container-id> supervisorctl start <program-name>
   ```

### Performance Issues?

1. Check CPU/memory:
   ```bash
   docker stats <container-id>
   ```

2. Check logs for errors:
   ```bash
   docker logs -f <container-id>
   ```

3. Restart all services:
   ```bash
   docker exec <container-id> supervisorctl restart all
   ```

### WebSocket issues (HMR not working)?

1. Check WebSocket connection:
   - Open browser DevTools → Network tab
   - Look for request to `/@vite/ws`
   - Should show green WebSocket badge

2. Verify nginx routing:
   ```bash
   docker exec <container-id> curl -i http://localhost/@vite/ws
   ```

3. Check frontend is running:
   ```bash
   docker exec <container-id> supervisorctl tail frontend
   ```

---

**Created**: 2025-04-19
**Purpose**: Detailed implementation reference for Web.dev.dockerfile
**For**: Developers needing to understand or debug the container
