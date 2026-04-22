# Smart Pocket Release Deployment

This directory contains Docker Compose configuration for running Smart Pocket using pre-built release images from GitHub Container Registry (GHCR).

## Quick Start

```bash
# 1. Ensure .env file has required variables
cat .env.example > .env
# Edit .env with your configuration

# 2. Start services
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs -f smart-pocket-backend
```

## Configuration

### Environment Variables

Required variables in `.env`:
- `API_KEYS` - Comma-separated list of valid API keys
- `ACTUAL_BUDGET_SERVER_URL` - URL to Actual Budget server
- `ACTUAL_BUDGET_PASSWORD` - Password for Actual Budget access
- `ACTUAL_BUDGET_ID` - Budget sync ID from Actual
- `GOOGLE_SHEET_ID` - (Optional) Google Sheets ID for sync
- `GOOGLE_SHEET_NAME` - (Optional) Sheet name within workbook
- `CLOUDFLARED_TOKEN` - Cloudflare Tunnel token for public HTTPS access

### Custom Image Versions

By default, uses `staging` tag. Override with environment variables:

```bash
# Use specific version
BACKEND_IMAGE=ghcr.io/patterueldev/smart-pocket/backend:v1.0.0 \
FRONTEND_IMAGE=ghcr.io/patterueldev/smart-pocket/frontend:v1.0.0 \
docker-compose up -d

# Or in docker-compose override
export BACKEND_IMAGE=ghcr.io/patterueldev/smart-pocket/backend:v1.0.0
export FRONTEND_IMAGE=ghcr.io/patterueldev/smart-pocket/frontend:v1.0.0
docker-compose up -d
```

## Architecture

```
┌─────────────────────────────────────────┐
│          Cloudflare Tunnel              │
│   (HTTPS public access via tunnel)      │
└─────────────┬───────────────────────────┘
              │
              ├─ smartpocketapi-dev.nicenature.space
              └─ smartpocket-dev.nicenature.space
              
┌─────────────────────────────────────────┐
│       Docker Compose Services           │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────────────────────────────┐   │
│ │   smart-pocket-backend           │   │
│ │   Image: ghcr.io/.../backend:... │   │
│ │   Port: 3000 → 80 (internal)     │   │
│ └──────────────────────────────────┘   │
│                                         │
│ ┌──────────────────────────────────┐   │
│ │   smart-pocket-frontend          │   │
│ │   Image: ghcr.io/.../frontend:..│   │
│ │   Port: 5173 → 80 (nginx)        │   │
│ └──────────────────────────────────┘   │
│                                         │
│ ┌──────────────────────────────────┐   │
│ │   cloudflared                    │   │
│ │   Image: cloudflare/cloudflared  │   │
│ │   Tunnel: Private to Public      │   │
│ └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Common Tasks

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f smart-pocket-backend
docker-compose logs -f smart-pocket-frontend
docker-compose logs -f cloudflared
```

### Update to New Version

```bash
# Pull latest staging images
docker-compose pull

# Restart services
docker-compose up -d

# View logs to confirm startup
docker-compose logs -f smart-pocket-backend
```

### Update to Specific Version

```bash
# Override image version for this run
BACKEND_IMAGE=ghcr.io/patterueldev/smart-pocket/backend:v1.0.0 \
FRONTEND_IMAGE=ghcr.io/patterueldev/smart-pocket/frontend:v1.0.0 \
docker-compose up -d
```

### Access Services

```bash
# Via Cloudflare Tunnel
# Backend API: https://smartpocketapi-dev.nicenature.space
# Frontend UI: https://smartpocket-dev.nicenature.space

# Via localhost (if ports uncommented)
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

### Test Backend Health

```bash
# Via localhost
curl http://localhost:3000/health

# Via Cloudflare Tunnel
curl https://smartpocketapi-dev.nicenature.space/health
```

## Services

### Backend Service

- **Image**: `ghcr.io/patterueldev/smart-pocket/backend:staging` (default)
- **Port**: 3000 (internal) → 80 (container)
- **Role**: Express.js API server, Actual Budget integration, Google Sheets sync
- **Environment**: Production
- **Restart**: unless-stopped

### Frontend Service

- **Image**: `ghcr.io/patterueldev/smart-pocket/frontend:staging` (default)
- **Port**: 5173 (mapped) → 80 (nginx container)
- **Role**: React web UI served via nginx
- **Environment**: Production
- **Restart**: unless-stopped
- **Depends On**: smart-pocket-backend

### Cloudflared Service

- **Image**: `cloudflare/cloudflared:latest`
- **Role**: Tunnel for secure HTTPS public access
- **Restart**: unless-stopped
- **Depends On**: Both backend and frontend

## Networking

```
Internal Docker Network:
- smart-pocket-backend:80 (backend service port)
- smart-pocket-frontend:80 (frontend nginx port)
- Cloudflared tunnels to configured routes
```

## Volumes

```
./keys:/data/keys:ro
  - Read-only access to API keys directory
  - Mount path: /data/keys (in container)
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs smart-pocket-backend
docker-compose logs smart-pocket-frontend

# Common issues:
# - Missing environment variables in .env
# - Images not available in GHCR (authentication)
# - Port conflicts (3000 or 5173 already in use)
```

### Images not pulling

```bash
# Authenticate to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Force pull latest
docker-compose pull --no-parallel
docker-compose up -d
```

### Health check issues

```bash
# Test backend directly
curl http://localhost:3000/health

# Check container logs
docker-compose logs smart-pocket-backend | tail -50
```

## Differences from Development

| Aspect | Development | Release |
|--------|-------------|---------|
| Build | Local from source | Pre-built from GHCR |
| Images | Dev dockerfiles | Release dockerfiles |
| Hot reload | Enabled (nodemon/Vite) | Disabled |
| Environment | development | production |
| Ports | 3000, 5173 (direct) | 3000→80, 5173→80 |
| Networking | Direct to host | Tunnel via Cloudflared |

## Deployment Checklist

- [ ] Environment variables configured in `.env`
- [ ] Docker daemon running
- [ ] Network connectivity verified
- [ ] GHCR authentication working
- [ ] Images pulled successfully
- [ ] Services started without errors
- [ ] Backend health check passes
- [ ] Frontend accessible via tunnel
- [ ] Actual Budget integration functional
- [ ] Google Sheets sync (if configured) working

## Useful Commands

```bash
# Build and push new images (from project root)
../scripts/build-and-push-release.sh --version v1.0.0 all

# Stop and clean up
docker-compose down -v

# Remove all containers and rebuild
docker system prune -a
docker-compose pull
docker-compose up -d

# Check resource usage
docker stats smart-pocket-backend smart-pocket-frontend

# Inspect running container
docker exec -it smart-pocket-backend sh
docker exec -it smart-pocket-frontend sh
```

## Environment File Template

Create `.env` from `.env` or `.env.example`:

```bash
# API Configuration
API_KEYS=your-api-key-here

# Actual Budget Integration
ACTUAL_BUDGET_SERVER_URL=https://your-actual-server.com
ACTUAL_BUDGET_PASSWORD=your-password
ACTUAL_BUDGET_ID=your-sync-id

# Google Sheets (optional)
GOOGLE_SHEET_ID=
GOOGLE_SHEET_NAME=

# Cloudflare Tunnel
CLOUDFLARED_TOKEN=your-tunnel-token

# Image Versions (optional, defaults to staging)
BACKEND_IMAGE=ghcr.io/patterueldev/smart-pocket/backend:staging
FRONTEND_IMAGE=ghcr.io/patterueldev/smart-pocket/frontend:staging
```

## Related Documentation

- See `../../scripts/README.md` - Build and push release images
- See `../../infrastructure/docker/DOCKER_GUIDE.md` - Docker technical details
- See `../../README.md` - Project overview

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review environment configuration in `.env`
3. Verify GHCR image availability and authentication
4. Check GitHub repository for known issues
