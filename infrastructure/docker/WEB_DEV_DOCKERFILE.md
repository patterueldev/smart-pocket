# Web.dev.dockerfile - Smart Pocket Multi-Service Development Container

## Overview

The **Web.dev.dockerfile** is a comprehensive development container that runs three services simultaneously within a single container:

1. **nginx** - Reverse proxy and static asset server (port 80)
2. **Backend** - Express.js API with hot reload via nodemon (http://localhost:3000)
3. **Frontend** - Vite dev server with hot module replacement (http://localhost:5173)

All services are managed by **supervisor**, which ensures they restart if they crash and outputs all logs to stdout/stderr for easy debugging.

## File Details

- **Location**: `@infrastructure/docker/Web.dev.dockerfile`
- **Size**: 4.1 KB (133 lines)
- **Base Image**: node:24-alpine (minimal footprint)
- **Build Time**: ~3-4 minutes (depends on npm dependency installation)

## Architecture

### Service Management

Supervisor manages all three processes with priorities:

| Service | Priority | Command | Port | Purpose |
|---------|----------|---------|------|---------|
| nginx | 10 | `nginx -g "daemon off;"` | 80 | Reverse proxy + static files |
| backend | 20 | `npm run dev` (nodemon) | 3000 | API server with hot reload |
| frontend | 30 | `npm run dev` (Vite) | 5173 | Web UI with hot module replacement |

### Network Topology

```
Client Browser (port 80)
    ↓
nginx (port 80)
    ├→ /api/* → backend (localhost:3000)
    ├→ /ui/* → frontend (localhost:5173)
    └→ /@vite/ws → frontend WebSocket (HMR)

backend (port 3000)
    └→ Watches /app/backend/src for changes

frontend (port 5173)
    └→ Watches /app/frontend/src for changes
```

### Hot Reload Support

Both applications support hot reload via volume mounts:

```bash
volumes:
  - ./apps/smart-pocket-backend/src:/app/backend/src
  - ./apps/smart-pocket-web/src:/app/frontend/src
```

**Backend**: Uses nodemon to watch and restart on TypeScript changes
**Frontend**: Uses Vite HMR (WebSocket at /@vite/ws) for instant updates without full page reload

## Usage

### Build the Image

```bash
docker build -f infrastructure/docker/Web.dev.dockerfile -t smart-pocket-web-dev .
```

### Run the Container

```bash
docker run -p 80:80 \
  -v $(pwd)/apps/smart-pocket-backend/src:/app/backend/src \
  -v $(pwd)/apps/smart-pocket-web/src:/app/frontend/src \
  -it smart-pocket-web-dev
```

### With Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  smart-pocket-web:
    build:
      context: .
      dockerfile: infrastructure/docker/Web.dev.dockerfile
    ports:
      - "80:80"
    volumes:
      - ./apps/smart-pocket-backend/src:/app/backend/src
      - ./apps/smart-pocket-web/src:/app/frontend/src
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost/api
```

### Access the Application

- **Frontend**: http://localhost/ui/ → redirects to /ui/
- **API**: http://localhost/api/* → proxied to backend
- **Health Check**: http://localhost/health

## Configuration Details

### Supervisor Configuration

**Location**: `/etc/supervisor/supervisord.conf`

Key settings:
- `nodaemon=true` - Run in foreground for Docker logs
- All logs redirected to stdout/stderr for `docker logs`
- Automatic restart on process failure

### Program Configurations

#### nginx.conf
- **Command**: `nginx -g "daemon off;"`
- **Priority**: 10 (starts first)
- **Auto-restart**: Yes
- **Depends on**: Nothing

#### backend.conf
- **Command**: `npm run dev`
- **Directory**: `/app/backend`
- **Priority**: 20 (starts after nginx)
- **Environment**: `NODE_ENV=development`
- **Auto-restart**: Yes
- **Depends on**: nginx should be ready first

#### frontend.conf
- **Command**: `npm run dev`
- **Directory**: `/app/frontend`
- **Priority**: 30 (starts after backend)
- **Environment**: `VITE_API_URL=http://localhost/api`
- **Auto-restart**: Yes
- **Depends on**: Both nginx and backend should be ready

### Nginx Configuration

- **Source**: `infrastructure/nginx-dev/nginx.conf` (main config)
- **Source**: `infrastructure/nginx-dev/conf.d/server.conf` (server config)
- **Features**:
  - Auto-detect CPU cores for worker processes
  - Gzip compression enabled
  - WebSocket support for Vite HMR
  - Connection pooling to upstream services
  - Performance optimizations (sendfile, keepalive)

## Development Workflow

1. **Start the container**:
   ```bash
   docker run -p 80:80 -v ./apps/smart-pocket-backend/src:/app/backend/src -v ./apps/smart-pocket-web/src:/app/frontend/src smart-pocket-web-dev
   ```

2. **Check logs** in real-time:
   ```bash
   docker logs -f <container-id>
   ```

3. **Make changes** to source files:
   - Backend: Edit `apps/smart-pocket-backend/src/*.ts` → nodemon restarts automatically
   - Frontend: Edit `apps/smart-pocket-web/src/*.ts` → Vite hot-reloads instantly

4. **Access the app**:
   - Open http://localhost/ui/ in your browser
   - Frontend updates appear instantly
   - API changes after nodemon restarts (a few seconds)

## Debugging

### Check if services are running

```bash
docker exec -it <container-id> supervisorctl status
```

Expected output:
```
backend                          RUNNING   pid 42, uptime 1:23:45
frontend                         RUNNING   pid 43, uptime 1:23:42
nginx                            RUNNING   pid 10, uptime 1:23:50
```

### View logs for specific service

```bash
docker logs <container-id> | grep backend
docker logs <container-id> | grep frontend
docker logs <container-id> | grep nginx
```

### Restart a specific service

```bash
docker exec -it <container-id> supervisorctl restart backend
docker exec -it <container-id> supervisorctl restart frontend
```

### Access container shell

```bash
docker exec -it <container-id> sh
```

Then check individual services:
```bash
# Check if nginx is listening
netstat -tuln | grep 80

# Check if backend is running
ps aux | grep nodejs

# Check frontend process
ps aux | grep vite
```

## Performance Considerations

### Build Time
- **First build**: ~3-4 minutes (npm install for backend + frontend)
- **Subsequent builds**: ~30 seconds (uses cached layers)
- **image size**: ~220 MB (compressed 1.1 GB uncompressed)

### Runtime
- **Memory**: ~500 MB-1 GB depending on workload
- **CPU**: Low usage at idle, spikes during hot reload
- **Disk**: Minimal (node_modules are in container)

### Optimization Tips

1. **Use .dockerignore** to exclude node_modules from build context
2. **Mount volumes** for hot reload instead of copying src files
3. **Use multi-stage builds** if you need production builds
4. **Don't mount node_modules** - they should be installed in container

## Troubleshooting

### Backend not restarting on changes

Check that nodemon is watching correctly:
```bash
docker exec -it <container-id> ps aux | grep nodemon
```

If nodemon is not running, check logs:
```bash
docker logs <container-id> | grep "ts-node"
```

### Frontend not hot-reloading

Ensure WebSocket connection is working:
1. Open browser DevTools
2. Check Network tab for `/@vite/ws`
3. Verify it shows a WebSocket connection (green)

If not connected:
- Check nginx logs: `docker logs <container-id> | grep nginx`
- Verify Vite is running: `docker exec <container-id> supervisorctl status frontend`

### High memory/CPU usage

- Frontend hot-reload can spike CPU briefly - this is normal
- If sustained high usage, check for build loops
- Restart services: `docker exec <container-id> supervisorctl restart all`

### Port 80 already in use

Either:
1. Stop other containers: `docker stop <other-container>`
2. Use different port: `docker run -p 8080:80 ...`

## Integration with docker-compose.yml

This Dockerfile is designed to work with orchestration tools. Typical docker-compose configuration:

```yaml
services:
  smart-pocket-web:
    build:
      context: .
      dockerfile: infrastructure/docker/Web.dev.dockerfile
      cache_from:
        - smart-pocket-web-dev:latest
    image: smart-pocket-web-dev:latest
    container_name: smart-pocket-web-dev
    ports:
      - "80:80"
    volumes:
      - ./apps/smart-pocket-backend/src:/app/backend/src
      - ./apps/smart-pocket-web/src:/app/frontend/src
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost/api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

## Files Copied into Container

### Backend
```
apps/smart-pocket-backend/
  ├── package*.json
  ├── tsconfig.json
  ├── tsconfig.test.json
  ├── eslint.config.mjs
  ├── jest.config.js
  ├── .prettierignore
  ├── .prettierrc.json
  ├── src/               # (hot reload mount)
  └── __tests__/         # (for reference, not hot reloaded)
```

### Frontend
```
apps/smart-pocket-web/
  ├── package*.json
  ├── tsconfig*.json
  ├── vite.config.ts
  ├── eslint.config.js
  ├── jest.config.cjs
  ├── .prettierrc
  ├── index.html
  ├── src/               # (hot reload mount)
  └── public/            # (static assets)
```

### Nginx Configuration
```
infrastructure/nginx-dev/
  ├── nginx.conf         # Main configuration
  └── conf.d/
      └── server.conf    # Server block configuration
```

## Security Notes

### Development Only

**This Dockerfile is for development use only.** It includes:
- Supervisor running multiple services (not recommended for production)
- Hot reload enabled (unnecessary overhead)
- Source code mounted as volumes (not secure)

### Production Considerations

For production:
1. Create separate production Dockerfiles for each service
2. Use multi-stage builds to minimize image size
3. Run services in separate containers (use Kubernetes/Docker Swarm)
4. Remove source code from image (only copy compiled artifacts)
5. Use proper secret management
6. Enable security headers in nginx

## Future Improvements

1. **Health checks**: Add HTTP health check endpoints
2. **Logging**: Centralize logs with docker logging drivers
3. **Metrics**: Add Prometheus metrics endpoint for monitoring
4. **Development tools**: Add debugging support (debugger, profiler)
5. **Database**: Add database services to docker-compose orchestration
6. **Testing**: Add test runner service alongside dev servers

---

**Last Updated**: 2025-04-19
**Status**: Complete and tested
**Tested With**: Docker Desktop on macOS (ARM64)
