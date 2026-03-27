# AGENTS.md - Smart Pocket Development Guide

This is the **master guide** for developers and AI agents working on the Smart Pocket project. It provides an overview of the project structure and points you to platform-specific guides for making changes.

---

## 🎯 Quick Navigation

**Where are you making changes?** Jump to the right guide:

### 📱 Mobile App Changes
- **Location**: `@apps/smart-pocket-mobile/`
- **Purpose**: React Native mobile application
- **Framework**: Expo + React Native + TypeScript
- **Guide**: See `@apps/smart-pocket-mobile/AGENTS.md` (if available) or `@apps/smart-pocket-mobile/README.md`
- **Common Tasks**:
  - Adding new screens
  - Building components
  - Connecting to backend API
  - Managing state
  - Building for iOS/Android

### 🖥️ Backend API Changes
- **Location**: `@apps/smart-pocket-backend/`
- **Purpose**: Express.js REST API
- **Framework**: Express 5.x + TypeScript (strict mode)
- **Guide**: See `@apps/smart-pocket-backend/AGENTS.md`
- **Common Tasks**:
  - Adding new API endpoints
  - Creating middleware
  - Implementing authentication
  - Database integration
  - Adding validation

### 🐳 Docker & Infrastructure
- **Locations**: 
  - `@docker/` - Dockerfile definitions
  - `@docker-compose.yml` - Service orchestration
- **Purpose**: Containerization and local development environment
- **Common Tasks**:
  - Modifying development container
  - Creating production builds
  - Configuring services
  - Setting up hot reload
  - Debugging container issues
- **Guides**:
  - `@docker/DOCKER_GUIDE.md` - Docker documentation
  - `@README.md` - Docker Compose setup

---

## 📊 Project Structure

```
smart-pocket/
├── apps/
│   ├── smart-pocket-backend/     ← 🖥️  Backend API (Express + TypeScript)
│   │   ├── AGENTS.md              ← Platform-specific guide
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── smart-pocket-mobile/       ← 📱 Mobile app (Expo + React Native)
│       ├── app.json
│       ├── package.json
│       ├── components/
│       ├── screens/
│       └── tsconfig.json
│
├── docker/                        ← 🐳 Container definitions
│   ├── Backend.dev.dockerfile     ← Development container
│   ├── Backend.prod.dockerfile    ← Production container
│   └── DOCKER_GUIDE.md            ← Docker documentation
│
├── docker-compose.yml             ← 🐳 Service orchestration
├── README.md                       ← 📖 Project setup guide
├── .env.example                   ← 📋 Configuration template
└── AGENTS.md                       ← 🤖 THIS FILE (master guide)
```

---

## 🚀 Getting Started

### First Time Setup

```bash
# 1. Clone the repository
git clone <repository>
cd smart-pocket

# 2. Copy environment configuration
cp .env.example .env

# 3. Start with Docker Compose
docker-compose up

# 4. Backend will be available at:
#    - Cloudflare Tunnel URL (from logs)
#    - Or localhost:3000 (if ports uncommented in docker-compose.yml)

# 5. Verify backend health
curl http://localhost:3000/health
```

**For more detailed setup**, see `@README.md`

### Development Workflow

1. **Before Making Changes**
   - Read the platform-specific AGENTS.md in the folder you're modifying
   - Ensure you understand the architecture and patterns
   - Verify development environment is running

2. **Making Changes**
   - Write/modify code in your platform folder
   - Run linting and tests (if available)
   - Test your changes

3. **Testing Changes**
   - Use Docker Compose for full environment: `docker-compose up`
   - Hot reload is enabled for backend and mobile (when applicable)
   - For backend: changes in `src/` automatically reload
   - For mobile: Expo hot reload is available

4. **Before Committing**
   - Run linter and formatter
   - Ensure no linting errors
   - Add appropriate git commit

---

## 🖥️ Backend Development Guide

**See**: `@apps/smart-pocket-backend/AGENTS.md` for complete guide

### Quick Reference - Backend

**Start Development**:
```bash
cd apps/smart-pocket-backend
npm install
npm run dev
```

**Linting & Formatting**:
```bash
npm run lint          # Check for errors
npm run lint:fix      # Fix automatic issues
npm run format        # Format code
npm run format:check  # Check formatting
```

**Key Files**:
- `src/app.ts` - Express app setup and middleware
- `src/index.ts` - Application entry point
- `src/controllers/` - HTTP request handlers
- `src/routes/` - API endpoints
- `src/middleware/` - Reusable middleware
- `src/utils/` - Utilities (logger, etc.)
- `src/config/` - Configuration management

**Architecture Pattern**:
```
Request → Routes → Controllers → (Services → Database)
                        ↓
                  Middleware (logging, validation, errors)
```

**Common Tasks**:
1. Adding a new endpoint
   - Create controller in `src/controllers/`
   - Add route in `src/routes/`
   - Add validation middleware
   - Test with `curl`

2. Adding middleware
   - Create in `src/middleware/`
   - Apply in `src/app.ts`
   - Test request/response flow

3. Debugging
   - Logs available in console (hot reload enabled)
   - Use logger: `logger.info()`, `logger.error()`
   - Check request/response in request logger middleware

**For detailed instructions**, see `@apps/smart-pocket-backend/AGENTS.md`

---

## 📱 Mobile Development Guide

**See**: `@apps/smart-pocket-mobile/` for complete guide (AGENTS.md if available)

### Quick Reference - Mobile

**Start Development**:
```bash
cd apps/smart-pocket-mobile
npm install
npm start
```

**Available Commands**:
```bash
npm start              # Start Expo CLI
a                      # Open on Android
i                      # Open on iOS
w                      # Open in web browser
```

**Expo Setup**:
- Download Expo Go app on your device
- Scan QR code from CLI
- App reloads automatically on save

**Key Folders**:
- `components/` - Reusable React components
- `screens/` - Full-screen components (pages)
- `hooks/` - Custom React hooks
- `constants/` - Constants and configuration
- `assets/` - Images and resources

**Technology Stack**:
- React Native (with Expo)
- TypeScript
- Axios/Fetch for API calls
- Navigation library (check package.json)

---

## 🐳 Docker & Infrastructure Guide

**See**: `@docker/DOCKER_GUIDE.md` for complete Docker documentation

### Quick Reference - Docker

**Service Definition** (`docker-compose.yml`):
```yaml
services:
  smart-pocket-backend:
    # Development container: Backend.dev.dockerfile
    # Volumes for hot reload
    # Port: 3000 (optional)
  
  cloudflared:
    # Cloudflare Tunnel for public HTTPS access
    # Requires CLOUDFLARED_TOKEN in .env
```

**Common Commands**:

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs smart-pocket-backend
docker-compose logs -f smart-pocket-backend    # Follow logs

# Stop services
docker-compose down

# Rebuild containers
docker-compose build --no-cache

# Access container shell
docker exec -it smart-pocket-backend sh
```

**Development Container** (`Backend.dev.dockerfile`):
- Image: `node:24-alpine`
- Hot reload enabled via volume mounts
- Runs: `npm run dev` (ts-node + nodemon)
- Watches: `src/` directory

**Production Container** (`Backend.prod.dockerfile`):
- Multi-stage build for smaller image
- Non-root user for security
- Health checks enabled
- Runs optimized build output

**Modifying Containers**:
- Edit Dockerfiles in `@docker/`
- Edit service configuration in `@docker-compose.yml`
- Rebuild: `docker-compose build --no-cache`
- Test: `docker-compose up`

---

## 🔧 Environment Configuration

**Configuration File**: `@.env.example`

**Key Variables**:
- `CLOUDFLARED_TOKEN` - Cloudflare Tunnel authentication (required for public access)
- `NODE_ENV` - Set to `development` or `production`

**Setup**:
```bash
# 1. Copy template
cp .env.example .env

# 2. Edit with your values
# For Cloudflare Tunnel: Get token from https://one.dash.cloudflare.com/
nano .env

# 3. Docker Compose will use .env automatically
docker-compose up
```

---

## 📚 Documentation Files

### By Purpose

| File | Purpose | Audience |
|------|---------|----------|
| `@AGENTS.md` (this file) | Project-wide guide | Developers & AI agents |
| `@apps/smart-pocket-backend/AGENTS.md` | Backend development | Backend developers |
| `@README.md` | Project setup & Docker Compose | Everyone |
| `@docker/DOCKER_GUIDE.md` | Docker technical details | DevOps & Docker users |
| `@apps/smart-pocket-backend/README.md` | Backend API documentation | API consumers |
| `@apps/smart-pocket-mobile/README.md` | Mobile setup | Mobile developers |

### When to Read What

**I want to...** → **Read this**

- Start a fresh development environment → `@README.md`
- Add a new backend endpoint → `@apps/smart-pocket-backend/AGENTS.md`
- Debug Docker issues → `@docker/DOCKER_GUIDE.md`
- Understand backend architecture → `@apps/smart-pocket-backend/AGENTS.md`
- Build a mobile feature → `@apps/smart-pocket-mobile/README.md`
- Set up Cloudflare Tunnel → `@README.md`
- Fix failing container → `@docker/DOCKER_GUIDE.md`
- Enable hot reload → `@docker/DOCKER_GUIDE.md`

---

## 🎯 Common Development Tasks

### Task: Add a New API Endpoint

1. **Read**: `@apps/smart-pocket-backend/AGENTS.md` (section on adding endpoints)
2. **Create Controller**: `apps/smart-pocket-backend/src/controllers/YourController.ts`
3. **Add Route**: `apps/smart-pocket-backend/src/routes/your.ts`
4. **Register Route**: Add to `apps/smart-pocket-backend/src/app.ts`
5. **Test**: `curl http://localhost:3000/your-endpoint`
6. **Verify Linting**: `npm run lint` (in backend folder)

### Task: Modify Development Container

1. **Read**: `@docker/DOCKER_GUIDE.md`
2. **Edit**: `@docker/Backend.dev.dockerfile`
3. **Update**: `@docker-compose.yml` if needed
4. **Rebuild**: `docker-compose build --no-cache`
5. **Test**: `docker-compose up`

### Task: Debug Container Issues

1. **Read**: `@docker/DOCKER_GUIDE.md` (Troubleshooting section)
2. **Check Logs**: `docker-compose logs smart-pocket-backend`
3. **Access Container**: `docker exec -it smart-pocket-backend sh`
4. **Verify Volumes**: Check `docker-compose.yml` volume mounts
5. **Rebuild**: `docker-compose build --no-cache`

### Task: Add Environment Variable

1. **Edit**: `@.env.example` (add with documentation)
2. **Edit**: `@.env` (add actual value)
3. **Reference**: In code via `process.env.YOUR_VAR`
4. **Test**: Start container: `docker-compose up`

---

## ✅ Quality Standards

### Code Quality

All code must pass:

**Backend**:
```bash
cd apps/smart-pocket-backend
npm run lint        # 0 errors
npm run format:check # 0 formatting issues
npm run build       # TypeScript compilation successful
```

**Mobile**:
```bash
cd apps/smart-pocket-mobile
npm run lint        # Check your linter
```

### TypeScript

- **Strict Mode Enabled** (backend)
- No `any` types without justification
- All functions have return types
- All variables properly typed

### Git Commits

```bash
git commit -m "Add new endpoint for user registration

- Creates POST /users endpoint
- Adds validation middleware
- Includes error handling
- Tests with curl"
```

---

## 🚨 Troubleshooting

### Backend Won't Start

1. Check logs: `docker-compose logs smart-pocket-backend`
2. Verify node_modules: `docker-compose down && docker-compose build --no-cache`
3. Check .env: Is it valid? (Use `.env.example` as template)
4. Port conflict: `lsof -i :3000` (if using ports instead of Tunnel)

### Hot Reload Not Working

1. Verify volumes in `docker-compose.yml` (check paths)
2. Check logs for nodemon: `docker-compose logs smart-pocket-backend`
3. Ensure `npm run dev` is running (not `npm start`)
4. Rebuild container: `docker-compose build --no-cache`

### CLOUDFLARED_TOKEN Error

1. Verify `.env` file exists: `ls -la .env`
2. Check token format: Should be long base64 string
3. Get new token: https://one.dash.cloudflare.com/ → Networks → Tunnels
4. Restart: `docker-compose down && docker-compose up`

### TypeScript Compilation Error

1. Check error message for file/line number
2. Open file and fix issue
3. Verify types are correct
4. Hot reload should pick up changes automatically

---

## 📖 For AI Agents

If you're an AI agent making changes:

1. **First**: Read this file (you are here ✓)
2. **Then**: Read the platform-specific AGENTS.md for your folder
3. **Always**: Follow the architecture patterns described
4. **Before Submitting**: Verify code passes linting and compiles
5. **Document**: Add comments for non-obvious logic
6. **Test**: Provide curl examples or test steps for new endpoints

### Architecture Constraints to Follow

- **Separation of Concerns**: Controllers handle HTTP, Services handle logic
- **Type Safety**: All TypeScript code in strict mode, no untyped any
- **Error Handling**: Use error handler middleware, return consistent error format
- **Validation**: Validate all inputs, use Joi schemas
- **Configuration**: Use environment variables, never hardcode secrets
- **Logging**: Use logger utility for all important operations

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Backend API Guide | `@apps/smart-pocket-backend/AGENTS.md` |
| Mobile Development | `@apps/smart-pocket-mobile/README.md` |
| Docker Documentation | `@docker/DOCKER_GUIDE.md` |
| Project Setup | `@README.md` |
| Docker Compose Config | `@docker-compose.yml` |
| Environment Template | `@.env.example` |
| Cloudflare Tunnels | https://one.dash.cloudflare.com/ |

---

## 📝 Summary

**This is your entry point.** Use this guide to:
1. Understand project structure
2. Find platform-specific guides
3. Reference architecture patterns
4. Troubleshoot common issues
5. Learn development workflows

**Next Steps**:
- Starting development? → Read `@README.md`
- Modifying backend? → Read `@apps/smart-pocket-backend/AGENTS.md`
- Working with Docker? → Read `@docker/DOCKER_GUIDE.md`
- Developing mobile? → Read `@apps/smart-pocket-mobile/README.md`

---

**Last Updated**: 2026-03-27  
**Status**: Complete and maintained  
**For**: Developers and AI Agents
