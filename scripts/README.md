# Smart Pocket Release Build Scripts

Build and push Smart Pocket release Docker images to GitHub Container Registry (GHCR).

## Scripts

### `build-and-push-release.sh`
Master script to build and push both Backend and Frontend images.

**Usage:**
```bash
./scripts/build-and-push-release.sh [OPTIONS] [TARGET]

# Build and push both with custom version
./scripts/build-and-push-release.sh --version v1.0.0 all

# Build only backend
./scripts/build-and-push-release.sh backend

# Build only frontend
./scripts/build-and-push-release.sh frontend

# Dry run (show what would happen)
./scripts/build-and-push-release.sh --dry-run all
```

**Options:**
- `-v, --version VERSION` - Docker image version tag (default: `latest`)
- `-r, --registry REGISTRY` - Container registry (default: `ghcr.io`)
- `-o, --owner OWNER` - Registry owner (default: `patterueldev`)
- `-n, --repo REPO` - Repository name (default: `smart-pocket`)
- `--dry-run` - Show commands without executing
- `-h, --help` - Show help message

### `build-backend-release.sh`
Build and push Backend release image only.

**Usage:**
```bash
./scripts/build-backend-release.sh [OPTIONS]

# Build and push with custom version
./scripts/build-backend-release.sh --version v1.0.0

# Build only (no push)
./scripts/build-backend-release.sh --no-push

# Dry run
./scripts/build-backend-release.sh --dry-run
```

**Options:**
- `-v, --version VERSION` - Docker image version tag (default: `latest`)
- `-r, --registry REGISTRY` - Container registry (default: `ghcr.io`)
- `-o, --owner OWNER` - Registry owner (default: `patterueldev`)
- `-n, --repo REPO` - Repository name (default: `smart-pocket`)
- `--no-push` - Build only, don't push to registry
- `--dry-run` - Show commands without executing
- `-h, --help` - Show help message

### `build-frontend-release.sh`
Build and push Frontend release image only.

**Usage:**
```bash
./scripts/build-frontend-release.sh [OPTIONS]

# Build and push with custom version
./scripts/build-frontend-release.sh --version v1.0.0

# Build only (no push)
./scripts/build-frontend-release.sh --no-push

# Dry run
./scripts/build-frontend-release.sh --dry-run
```

**Options:**
- `-v, --version VERSION` - Docker image version tag (default: `latest`)
- `-r, --registry REGISTRY` - Container registry (default: `ghcr.io`)
- `-o, --owner OWNER` - Registry owner (default: `patterueldev`)
- `-n, --repo REPO` - Repository name (default: `smart-pocket`)
- `--no-push` - Build only, don't push to registry
- `--dry-run` - Show commands without executing
- `-h, --help` - Show help message

## Environment Variables

Override defaults using environment variables:

```bash
# Build with custom version and owner
VERSION=v2.0.0 OWNER=myorg ./scripts/build-and-push-release.sh all

# Build for a different registry
REGISTRY=docker.io OWNER=myusername ./scripts/build-backend-release.sh
```

**Available variables:**
- `REGISTRY` - Container registry (default: `ghcr.io`)
- `OWNER` - Registry owner (default: `patterueldev`)
- `REPO` - Repository name (default: `smart-pocket`)
- `VERSION` - Image version tag (default: `latest`)

## Prerequisites

1. **Docker**: Must have Docker installed and running
2. **Authentication**: Must be logged in to the target registry
   ```bash
   # For GitHub Container Registry
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```
3. **Repository Root**: Run scripts from the project root directory

## Examples

### Build Development Version
```bash
./scripts/build-and-push-release.sh --version v1.0.0-dev all
```

### Build Production Release
```bash
./scripts/build-and-push-release.sh --version v1.0.0 all
```

### Build Only Backend, Don't Push
```bash
./scripts/build-backend-release.sh --no-push
```

### Dry Run to See Commands
```bash
./scripts/build-and-push-release.sh --dry-run --version v1.0.0 all
```

### Build Separate Services with Different Versions
```bash
# Backend
./scripts/build-backend-release.sh --version v1.0.0

# Frontend (can be different version if needed)
./scripts/build-frontend-release.sh --version v1.0.0
```

### Build to Different Registry
```bash
REGISTRY=docker.io OWNER=myusername ./scripts/build-and-push-release.sh --version v1.0.0 all
```

## Output Images

Images are tagged with both version and `latest`:

```bash
ghcr.io/patterueldev/smart-pocket/backend:v1.0.0
ghcr.io/patterueldev/smart-pocket/backend:latest

ghcr.io/patterueldev/smart-pocket/frontend:v1.0.0
ghcr.io/patterueldev/smart-pocket/frontend:latest
```

## Build Details

Each build includes metadata:

- **BUILD_DATE**: ISO 8601 timestamp of build
- **GIT_SHA**: Current git commit SHA (short form)

These are passed as build arguments to the Dockerfiles.

## Troubleshooting

### Authentication Error
```
Error response from daemon: unauthorized: authentication required
```

**Solution**: Log in to the registry first
```bash
docker login ghcr.io
```

### Docker Not Running
```
Error response from daemon: dial unix /var/run/docker.sock: connect: no such file or directory
```

**Solution**: Start Docker daemon
```bash
# On macOS with Docker Desktop
open /Applications/Docker.app
```

### Build Fails
Check the full output for error details:
- Missing files in build context
- Syntax errors in Dockerfile
- Missing dependencies

Use `--dry-run` first to verify the commands would be correct.

## Integration with CI/CD

For GitHub Actions, these scripts are meant as local development tools. GitHub Actions has its own workflow-based builds (see `.github/workflows/`). These scripts are useful for:

- Local testing before committing
- Manual release builds
- Debugging dockerfile issues
- Publishing custom versions

## Related Documentation

- See `infrastructure/docker/DOCKER_GUIDE.md` for dockerfile details
- See `.github/workflows/` for CI/CD build automation
- See `AGENTS.md` for project overview
