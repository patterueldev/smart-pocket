# Docker Development & Release Guide

## Overview

Smart Pocket includes Docker support for development and release (production) environments.

## Available Dockerfiles

### Development Containers

#### Backend.dev.dockerfile
- **Purpose**: Local development with hot reload
- **Base Image**: Node.js 24 Alpine
- **Features**:
  - Auto-compilation with ts-node
  - Hot reload with nodemon
  - Volume mounts for live code sync
  - Development dependencies installed

#### Frontend.dev.dockerfile
- **Purpose**: Frontend development with Vite HMR
- **Base Image**: Node.js 24 Alpine
- **Features**:
  - Vite dev server with Hot Module Replacement
  - Watch mode for file changes
  - Volume mounts for live code sync

### Release (Production) Containers

#### Backend.release.dockerfile
- **Purpose**: Optimized production deployment for backend
- **Base Image**: Node.js 24 Alpine (multi-stage build)
- **Features**:
  - Compiled TypeScript (dist/)
  - Production dependencies only
  - nginx reverse proxy on port 80
  - supervisor managing Node.js (port 3001) and nginx
  - Health checks included

#### Frontend.release.dockerfile
- **Purpose**: Optimized production deployment for frontend
- **Base Image**: nginx Alpine
- **Features**:
  - Static nginx server (no Node.js runtime)
  - SPA routing (all requests → index.html)
  - Asset caching (1 year for static files)
  - Minimal image size
  - Health checks included

#### Web.release.dockerfile (Experimental)
- **Purpose**: Unified production build combining backend + frontend
- **Use Case**: Single-container deployment with both services
- **Features**:
  - Multi-stage build for backend and frontend
  - supervisor managing both Node.js and nginx
  - nginx reverse proxy:
    - `/api/*` → Node.js backend (3001)
    - `/ui/*` and `/*` → frontend static files
  - Shared single port (80)
  - Health checks included
- **Note**: Experimental. Use separate Backend/Frontend dockerfiles if this doesn't work well

## Development Workflow

### Using Docker Compose

Start the development environment:
```bash
docker-compose up
```

The backend will be available at `http://localhost:3000`

**Features:**
- Changes to `src/` directory are reflected immediately
- Server auto-restarts on file changes
- Port 3000 exposed on host
- Environment variables loaded from `.env`

View logs:
```bash
docker-compose logs -f smart-pocket-backend
```

Stop containers:
```bash
docker-compose down
```

### Building Manually

Build development image:
```bash
docker build \
  -f infrastructure/docker/Backend.dev.dockerfile \
  -t smart-pocket-backend:dev \
  ./apps/smart-pocket-backend
```

Run container:
```bash
docker run \
  -p 3000:3000 \
  -v $(pwd)/apps/smart-pocket-backend/src:/app/src \
  -e NODE_ENV=development \
  smart-pocket-backend:dev
```

### Volume Mounts (Hot Reload)

The docker-compose setup includes volume mounts for live code synchronization:

```yaml
volumes:
  - ./apps/smart-pocket-backend/src:/app/src          # Watch source files
  - ./apps/smart-pocket-backend/package.json:/app/package.json
  - /app/node_modules                                  # Don't override node_modules
```

**How it works:**
1. Changes in local `src/` are synced to container's `/app/src`
2. nodemon detects file changes
3. ts-node recompiles TypeScript
4. Server automatically restarts
5. Changes visible immediately in browser

### Docker Compose Configuration

```yaml
smart-pocket-backend:
  build: 
    context: ./apps/smart-pocket-backend
    dockerfile: ../../infrastructure/docker/Backend.dev.dockerfile
  container_name: smart-pocket-backend
  ports:
    - "3000:3000"                              # Expose port
  volumes:
    - ./apps/smart-pocket-backend/src:/app/src # Hot reload
    - ./apps/smart-pocket-backend/package.json:/app/package.json
    - /app/node_modules                         # Persist node_modules
  environment:
    - NODE_ENV=development                      # Dev mode
  restart: unless-stopped                       # Auto-restart on crash
```

## Testing

### Health Check

From host:
```bash
curl http://localhost:3000/health
```

From another container:
```bash
docker exec smart-pocket-backend curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2026-03-27T10:37:03.756Z"
}
```

### View Logs

```bash
# All logs
docker-compose logs smart-pocket-backend

# Tail logs
docker-compose logs -f smart-pocket-backend

# Last 100 lines
docker-compose logs --tail=100 smart-pocket-backend
```

## Production Deployment

### Build Production Image

```bash
docker build \
  -f infrastructure/docker/Backend.release.dockerfile \
  -t smart-pocket-backend:latest \
  ./apps/smart-pocket-backend
```

### Run Production Container

```bash
docker run \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart always \
  --health-cmd='curl -f http://localhost:3000/health || exit 1' \
  --health-interval=30s \
  smart-pocket-backend:latest
```

### Features

- **Multi-stage Build**: Only production code and dependencies included
- **Health Checks**: Automatic health status monitoring
- **Non-root User**: Runs as nodejs user for security
- **Minimal Size**: Alpine Linux + production deps only
- **Auto-restart**: `--restart always` for uptime

## Release Build Strategies

### Strategy 1: Separate Backend + Frontend (Recommended)

Build and deploy as two separate services:

**Backend Release:**
```bash
docker build \
  -f infrastructure/docker/Backend.release.dockerfile \
  -t smart-pocket-api:latest \
  ./apps/smart-pocket-backend
```

**Frontend Release:**
```bash
docker build \
  -f infrastructure/docker/Frontend.release.dockerfile \
  -t smart-pocket-web:latest \
  ./apps/smart-pocket-web
```

**Benefits:**
- ✅ Independent scaling of backend and frontend
- ✅ Separate deployments for different update cycles
- ✅ Backend and frontend on different domains
- ✅ Better resource isolation
- ✅ Easier debugging and troubleshooting

### Strategy 2: Unified Web Build (Experimental)

Combine backend and frontend in a single container with nginx reverse proxy:

```bash
docker build \
  -f infrastructure/docker/Web.release.dockerfile \
  -t smart-pocket-web:unified \
  ./
```

**Features:**
- Single-container deployment
- nginx reverse proxy routes:
  - `/api/*` → Node.js backend (port 3001)
  - `/ui/*` and `/*` → frontend static files
- supervisor manages both services
- Single port (80) exposed

**Benefits:**
- ✅ Single container to manage
- ✅ Simpler deployment
- ✅ No cross-origin issues (same origin for API and UI)

**Tradeoffs:**
- ⚠️ Can't scale backend and frontend independently
- ⚠️ Backend and frontend updates require rebuilding entire image
- ⚠️ Both services must fit in one container
- ⚠️ Harder to debug when either service has issues
- ⚠️ Experimental - may have issues

**When to Use Unified Build:**
- Single server deployment
- Cost-conscious (minimize container count)
- Don't need independent scaling
- Deployment simplicity is priority

**When to Use Separate Builds:**
- Multiple servers / Kubernetes
- Need independent scaling
- Frequent updates to either service
- Want clear separation of concerns
- Production deployments

## Frontend Release Dockerfile Details

The `Frontend.release.dockerfile`:
- **Base**: nginx:latest-alpine
- **Optimization**: SPA routing, asset caching
- **Size**: ~10-15 MB (production bundle)
- **Port**: 80
- **Features**:
  - All requests routed to index.html (SPA routing)
  - Static assets cached with 1-year TTL
  - index.html never cached (no-cache headers)
  - Health check via nginx

### SPA Routing Explanation

The nginx config handles React Router and other SPAs:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This means:
1. If request is for a file/directory that exists → serve it
2. Otherwise → serve index.html (let React Router handle routing)

This allows URLs like `/sync`, `/setup` to work without server-side routes.


## Troubleshooting

### Hot Reload Not Working

**Problem**: Code changes not reflected in running container

**Solution**:
1. Verify volume mounts are correct
   ```bash
   docker-compose exec smart-pocket-backend mount | grep '/app/src'
   ```

2. Check file permissions
   ```bash
   ls -la apps/smart-pocket-backend/src/
   ```

3. Rebuild container
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Port Already in Use

**Problem**: `Port 3000 is already allocated`

**Solution**:
1. Check what's using the port
   ```bash
   lsof -i :3000
   ```

2. Change port in docker-compose.yml
   ```yaml
   ports:
     - "3001:3000"  # Map 3001 on host to 3000 in container
   ```

### Node Modules Mismatch

**Problem**: Different node_modules in container vs host

**Solution**: Don't mount node_modules, let Docker manage it
```yaml
volumes:
  - ./apps/smart-pocket-backend/src:/app/src
  - /app/node_modules  # Anonymous volume, not synced
```

### Memory Issues

**Problem**: Container crashes or slow performance

**Solution**: Increase Docker memory limit
```yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## Docker Commands Reference

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Run command in container
docker-compose exec smart-pocket-backend npm run lint

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Remove images
docker rmi image-id

# Clean up unused resources
docker system prune
```

## Environment Variables

Create `.env` file in project root:

```env
NODE_ENV=development
PORT=3000
CLOUDFLARED_TOKEN=your_token_here
```

The `.env` file is automatically loaded by Docker containers.

## CI/CD Integration

For CI/CD pipelines, use the production Dockerfile:

```bash
# Build image
docker build \
  -f infrastructure/docker/Backend.release.dockerfile \
  -t smart-pocket-backend:$VERSION \
  ./apps/smart-pocket-backend

# Push to registry
docker push smart-pocket-backend:$VERSION

# Run tests
docker run smart-pocket-backend:$VERSION npm test

# Run linting
docker run smart-pocket-backend:$VERSION npm run lint
```

## Monitoring

### Check Container Health

```bash
docker-compose ps
# Shows health status
```

### View Resource Usage

```bash
docker stats smart-pocket-backend
# Shows CPU, memory, network usage
```

### View Container Logs with Timestamps

```bash
docker-compose logs --timestamps smart-pocket-backend
```

## Security Best Practices

✅ **Development Dockerfile**:
- Uses official Node.js image
- Installs minimal dependencies
- No secrets in image

✅ **Production Dockerfile**:
- Multi-stage build (reduced size)
- Non-root user (nodejs)
- Health checks enabled
- Minimal base image (Alpine)
- Production-only dependencies

❌ **Avoid**:
- Running as root
- Storing secrets in Dockerfile
- Large images
- Unnecessary dependencies

## Next Steps

1. **Volume Optimization**: Use named volumes for better performance
2. **Networking**: Set up custom Docker network if needed
3. **Registry**: Push images to Docker Hub or private registry
4. **Orchestration**: Use Kubernetes or Docker Swarm for production
5. **Monitoring**: Add logging (ELK, Splunk) and monitoring (Prometheus, Grafana)
