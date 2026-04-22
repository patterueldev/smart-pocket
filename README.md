# Smart Pocket - Backend Setup

Complete guide to setting up and running the Smart Pocket Backend with Docker Compose.

## Quick Start (Cloudflare Tunnel - Recommended)

The fastest way to get started with automatic public URL via Cloudflare Tunnel.

### 1. Get Cloudflare Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks → Tunnels**
3. Click **Create a tunnel**
4. Choose a name (e.g., "smart-pocket-backend")
5. Copy the token from the installation command
6. The token looks like: `eyJhIjoiYWJjZGVmZ2hpamtsbW5vcCIsInQiOiJhYmNkZWZnaGlqa2xtbm9wIiwicyI6ImFiY2RlZmdoaWprbG1ub3AifQ==`

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env` and add your Cloudflare token:

```env
CLOUDFLARED_TOKEN=eyJhIjoiYWJjZGVmZ2hpamtsbW5vcCIsInQiOiJhYmNkZWZnaGlqa2xtbm9wIiwicyI6ImFiY2RlZmdoaWprbG1ub3AifQ==
```

### 3. Start Backend

```bash
docker-compose up
```

**That's it!** 🎉

### 4. Access Your Backend

Your backend will be accessible via the Cloudflare Tunnel URL shown in the logs:

```
cloudflared  | Congratulations on running a Tunnel! Visit it here: https://your-subdomain.trycloudflare.com
```

Test the health endpoint:

```bash
curl https://your-subdomain.trycloudflare.com/health
```

Expected response:

```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2026-03-27T10:48:20.339Z"
}
```

---

## Alternative: Regular Ports (Local Development)

If you don't want to use Cloudflare Tunnel, you can expose the backend on port 3000.

### 1. Create .env File

```bash
cp .env.example .env
```

Edit `.env` (leave CLOUDFLARED_TOKEN empty or remove the line):

```env
# Optional - leave empty or comment out if using regular ports
# CLOUDFLARED_TOKEN=
```

### 2. Enable Port Mapping

Edit `docker-compose.yml` and uncomment the ports section:

```yaml
smart-pocket-backend:
  # ... other config ...
  ports:
    - "3000:3000"  # Uncomment this line
```

### 3. Disable Cloudflared (Optional)

If you don't need Cloudflare Tunnel, remove or comment out the cloudflared service in `docker-compose.yml`:

```yaml
# cloudflared:
#   image: cloudflare/cloudflared:latest
#   # ... rest of config ...
```

### 4. Start Backend

```bash
docker-compose up
```

### 5. Access Your Backend

Backend will be available at:

```
http://localhost:3000
```

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

---

## Docker Compose Commands

### Start Backend

```bash
# Start and show logs
docker-compose up

# Start in background
docker-compose up -d
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f smart-pocket-backend

# View cloudflared logs only
docker-compose logs -f cloudflared

# View last 100 lines
docker-compose logs --tail=100 smart-pocket-backend
```

### Stop Backend

```bash
# Stop and remove containers
docker-compose down

# Stop only (keep volumes)
docker-compose stop

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Rebuild

```bash
# Rebuild the image
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Run Commands in Container

```bash
# Run linting
docker-compose exec smart-pocket-backend npm run lint

# Auto-fix linting issues
docker-compose exec smart-pocket-backend npm run lint:fix

# Run formatting check
docker-compose exec smart-pocket-backend npm run format:check

# Open shell in container
docker-compose exec smart-pocket-backend sh
```

---

## Environment Variables

### .env.example

```env
CLOUDFLARED_TOKEN=your-cloudflared-token-here
```

### Configuration

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `CLOUDFLARED_TOKEN` | No | Cloudflare Tunnel token for public URL | Empty |
| `NODE_ENV` | No | Environment mode (set by docker-compose) | `development` |

The backend is always started in development mode with:
- TypeScript compilation
- Hot reload on code changes
- Full source code included
- Development dependencies installed

---

## Hot Reload

The backend supports **instant hot reload** for development:

1. **Edit code** in `apps/smart-pocket-backend/src/`
2. **Changes sync** to container automatically
3. **Server restarts** with new code (~1 second)
4. **Refresh browser** to see changes

Example:

```bash
# 1. Start backend
docker-compose up

# 2. In another terminal, edit a file
nano apps/smart-pocket-backend/src/controllers/healthController.ts

# 3. Save the file
# 4. Server auto-restarts (watch docker-compose logs)
# 5. Refresh your browser at https://your-url/health or http://localhost:3000/health
```

---

## Project Structure

```
smart-pocket/
├── docker-compose.yml              # Compose configuration
├── .env.example                    # Environment variables template
├── infrastructure/
│   └── docker/
│       ├── Backend.dev.dockerfile      # Development image
│       ├── Backend.prod.dockerfile     # Production image
│       ├── Backend.test.dockerfile     # Testing image
│       ├── Web.dev.dockerfile          # Web dev image
│       └── DOCKER_GUIDE.md             # Detailed Docker guide
├── apps/
│   └── smart-pocket-backend/
│       ├── src/                    # Source code (TypeScript)
│       ├── dist/                   # Compiled JavaScript
│       ├── package.json            # Dependencies
│       ├── tsconfig.json           # TypeScript config
│       ├── eslint.config.mjs        # Linting config
│       ├── .prettierrc.json        # Formatting config
│       ├── .dockerignore           # Docker build exclusions
│       ├── AGENTS.md               # Developer guide
│       └── README.md               # Backend README
└── FAAS.md                         # Project documentation
```

---

## Cloudflare Tunnel vs Regular Ports

### Cloudflare Tunnel (Recommended)

**Pros:**
- ✅ No port forwarding needed
- ✅ Public HTTPS URL automatically
- ✅ No firewall configuration
- ✅ Secure tunnel to Cloudflare
- ✅ Easy to share with team
- ✅ Works from anywhere
- ✅ No need to expose local machine

**Cons:**
- ❌ Requires Cloudflare account
- ❌ Requires internet connection
- ❌ Slightly higher latency

**Best for:**
- Team development
- Testing on multiple devices
- Production-like testing
- Sharing URLs with others
- CI/CD pipelines

### Regular Ports

**Pros:**
- ✅ No external service required
- ✅ Low latency
- ✅ Simple setup
- ✅ Works offline

**Cons:**
- ❌ Only accessible on localhost
- ❌ Requires port forwarding for remote access
- ❌ Not shareable to team
- ❌ Harder to test on mobile/other devices

**Best for:**
- Local development only
- Quick testing
- No internet connectivity
- Simple setups

---

## Troubleshooting

### "Port 3000 already in use"

**Problem:** Another service is using port 3000

**Solution:**

Option 1: Stop the other service

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID)
kill <PID>
```

Option 2: Use different port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Map 3001 on host to 3000 in container
```

### "CLOUDFLARED_TOKEN not found"

**Problem:** .env file not created or token not set

**Solution:**

```bash
# Create .env file
cp .env.example .env

# Edit and add your token
nano .env

# Or temporarily set it
export CLOUDFLARED_TOKEN=your-token-here
docker-compose up
```

### Hot reload not working

**Problem:** Code changes not reflected in container

**Solution:**

1. Check volume mounts are correct
   ```bash
   docker-compose exec smart-pocket-backend mount | grep '/app/src'
   ```

2. Rebuild container
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Health endpoint returns 404

**Problem:** Backend is running but endpoint not found

**Solution:**

1. Check container is running
   ```bash
   docker-compose ps
   ```

2. Check logs for errors
   ```bash
   docker-compose logs smart-pocket-backend
   ```

3. Verify port/URL is correct
   - Cloudflare: `https://your-url/health`
   - Regular: `http://localhost:3000/health`

### Docker image build fails

**Problem:** "failed to build" error

**Solution:**

```bash
# Rebuild with more details
docker-compose build --no-cache

# Check Docker daemon is running
docker ps

# Free up space
docker system prune
```

---

## Development Workflow

### 1. Start Backend

```bash
docker-compose up
```

Watch for this message:

```
smart-pocket-backend  | [INFO] Server running on port 3000
```

### 2. Make Changes

Edit code in `apps/smart-pocket-backend/src/`:

```bash
nano apps/smart-pocket-backend/src/app.ts
```

### 3. Save & Test

Changes auto-reload. Test endpoint:

```bash
# Cloudflare Tunnel
curl https://your-url/health

# Regular ports
curl http://localhost:3000/health
```

### 4. Check Quality

```bash
# Lint code
docker-compose exec smart-pocket-backend npm run lint

# Format code
docker-compose exec smart-pocket-backend npm run format
```

### 5. Stop When Done

```bash
docker-compose down
```

---

## Production Deployment

For production, use the optimized production image:

```bash
# Build production image
docker build \
  -f infrastructure/docker/Backend.prod.dockerfile \
  -t smart-pocket-backend:latest \
  ./apps/smart-pocket-backend

# Run with environment variables
docker run \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart always \
  smart-pocket-backend:latest
```

See `infrastructure/docker/DOCKER_GUIDE.md` for more production details.

---

## Next Steps

1. **Copy .env.example**: `cp .env.example .env`
2. **Add your token**: Edit `.env` with Cloudflare token
3. **Start backend**: `docker-compose up`
4. **Test endpoint**: Visit the URL in logs + `/health`
5. **Start developing**: Edit code in `apps/smart-pocket-backend/src/`

---

## Documentation

- **Backend AGENTS.md**: `apps/smart-pocket-backend/AGENTS.md` - Developer guide
- **Docker Guide**: `infrastructure/docker/DOCKER_GUIDE.md` - Detailed Docker documentation
- **Backend README**: `apps/smart-pocket-backend/README.md` - Backend info

---

## Support

For detailed information:
- Backend setup: See `apps/smart-pocket-backend/README.md`
- Docker setup: See `infrastructure/docker/DOCKER_GUIDE.md`
- Development: See `apps/smart-pocket-backend/AGENTS.md`
- This project: See `FAAS.md`

---

## Quick Reference

```bash
# Cloudflare Tunnel (Recommended)
cp .env.example .env
# Edit .env with your CLOUDFLARED_TOKEN
docker-compose up

# Regular ports
cp .env.example .env
# Edit docker-compose.yml: uncomment ports section
docker-compose up

# Common commands
docker-compose logs -f              # View logs
docker-compose down                 # Stop backend
docker-compose exec smart-pocket-backend npm run lint  # Run linting
```

---

**Happy coding! 🚀**
