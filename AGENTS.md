# AGENTS.md - Smart Pocket Development Guide

This is the **master guide** for developers and AI agents working on the Smart Pocket project. It provides an overview of the project structure and points you to platform-specific guides for making changes.

---

## 📚 Documentation Pattern: AGENTS.md + README.md

**Smart Pocket now follows a standardized documentation pattern** across all directories:

### AGENTS.md (This File & Paired Guides)
- **Purpose**: Quick reference for AI agents and developers
- **Size**: ~300-400 lines (lightweight, fits in AI token budget)
- **Content**: 
  - Quick navigation & links
  - Key conventions & critical files
  - Common tasks with links to detailed docs
  - Delegates to README.md for details
- **When to read**: "I need to make a quick change"
- **Example**: `@apps/smart-pocket-mobile/AGENTS.md` (8.4 KB, 200 lines)

### README.md (Paired with AGENTS.md)
- **Purpose**: Comprehensive documentation with deep dives
- **Size**: 2000+ lines (complete reference)
- **Content**:
  - Getting started guides
  - Architecture deep dives
  - Full code examples
  - Troubleshooting with solutions
  - Appendices with detailed patterns
- **When to read**: "I need to understand how something works"
- **Example**: `@apps/smart-pocket-mobile/README.md` (27 KB, 900 lines)

### Pattern in Action

```
Developer/AI Agent needs info:
  ↓
Read lightweight AGENTS.md (quick reference)
  ↓
Find relevant section with link to README.md
  ↓
Jump to README.md for comprehensive details
  ↓
Return to AGENTS.md for quick commands/conventions
```

**Benefits**:
- ✅ AI agents stay within token budget (~1000 tokens for AGENTS.md)
- ✅ Developers get both quick reference AND comprehensive docs
- ✅ Easy to maintain: AGENTS.md links, README.md is the source of truth
- ✅ Clear pattern: same structure across all directories

### Current Implementation

| Directory | AGENTS.md | README.md | Status |
|-----------|-----------|-----------|--------|
| Root | `AGENTS.md` | `README.md` | ✅ Pattern established |
| `@apps/smart-pocket-mobile/` | `AGENTS.md` (8.4 KB) | `README.md` (27 KB) | ✅ Refactored |
| `@apps/smart-pocket-backend/` | `AGENTS.md` | `README.md` | ⏳ To follow pattern |
| `@cicd/` | `AGENTS.md` | `README.md` | ⏳ To follow pattern |

---

## 🎯 Quick Navigation

**Where are you making changes?** Jump to the right guide:

### 📱 Mobile App Changes
- **Location**: `@apps/smart-pocket-mobile/`
- **Purpose**: React Native mobile application
- **Framework**: Expo + React Native + TypeScript
- **Guide**: **`@apps/smart-pocket-mobile/AGENTS.md`** ← Start here! (AI-optimized for quick navigation)
- **Architecture**: Follows SOLID principles with DIP/LSP via ServiceFactory pattern
- **Services**: Auth, Storage, API with real + mock implementations
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
  - `@infrastructure/docker/` - Dockerfile definitions
  - `@docker-compose.yml` - Service orchestration
- **Purpose**: Containerization and local development environment
- **Common Tasks**:
  - Modifying development container
  - Creating production builds
  - Configuring services
  - Setting up hot reload
  - Debugging container issues
- **Guides**:
  - `@infrastructure/docker/DOCKER_GUIDE.md` - Docker documentation
  - `@README.md` - Docker Compose setup

### 🚀 CI/CD & Release Workflows
- **Location**: `@cicd/`
- **Purpose**: GitHub Actions workflows, branch strategy, release automation
- **Strategy**: RC (Release Candidate) branches with test deployments
- **Common Tasks**:
  - Understanding the branching strategy
  - Creating release candidates
  - Deploying to production
  - Troubleshooting workflow failures
  - Checking Actions credit usage
- **Guides**:
  - `@cicd/AGENTS.md` - Quick reference guide (start here!)
  - `@cicd/README.md` - Comprehensive workflow documentation
- **Key Workflows** (in `@.github/workflows/`):
  - `pr-base-checks.yml` - Enforce rc/* only merges to main
  - `pr-develop-checks.yml` - Lint, build, test on feature PRs
  - `pr-main-build.yml` - Full builds on RC PRs to main
  - `deploy-orchestrator.yml` - Production deployment automation

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
├── cicd/                          ← 🚀 CI/CD Workflows & Documentation
│   ├── AGENTS.md                  ← Quick reference guide
│   └── README.md                  ← Comprehensive workflow docs
│
├── infrastructure/                ← 🏗️ Infrastructure files
│   └── docker/                    ← 🐳 Container definitions
│       ├── Backend.dev.dockerfile     ← Development container
│       ├── Backend.prod.dockerfile    ← Production container
│       ├── Backend.test.dockerfile    ← Test container
│       ├── Web.dev.dockerfile         ← Web dev container
│       └── DOCKER_GUIDE.md            ← Docker documentation
│
├── .github/workflows/             ← 🚀 GitHub Actions workflows
│   ├── pr-base-checks.yml         ← Enforce rc/* only to main
│   ├── pr-develop-checks.yml      ← Feature branch checks
│   ├── pr-main-build.yml          ← Full builds on RC PRs
│   └── deploy-orchestrator.yml    ← Production deployment
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

**See**: `@infrastructure/docker/DOCKER_GUIDE.md` for complete Docker documentation

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
- Edit Dockerfiles in `@infrastructure/docker/`
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
| `@apps/smart-pocket-mobile/AGENTS.md` | Mobile development | Mobile developers |
| `@cicd/AGENTS.md` | **CI/CD quick reference** | **All developers** |
| `@cicd/README.md` | **Complete CI/CD workflows** | **DevOps & release managers** |
| `@README.md` | Project setup & Docker Compose | Everyone |
| `@infrastructure/docker/DOCKER_GUIDE.md` | Docker technical details | DevOps & Docker users |
| `@apps/smart-pocket-backend/README.md` | Backend API documentation | API consumers |
| `@apps/smart-pocket-mobile/README.md` | Mobile setup | Mobile developers |

### When to Read What

**I want to...** → **Read this**

- Start a fresh development environment → `@README.md`
- Understand the branching & release strategy → `@cicd/AGENTS.md` (quick) or `@cicd/README.md` (detailed)
- Create a release candidate → `@cicd/AGENTS.md`
- Deploy to production → `@cicd/README.md`
- Troubleshoot CI/CD failures → `@cicd/README.md`
- Add a new backend endpoint → `@apps/smart-pocket-backend/AGENTS.md`
- Debug Docker issues → `@infrastructure/docker/DOCKER_GUIDE.md`
- Understand backend architecture → `@apps/smart-pocket-backend/AGENTS.md`
- Build a mobile feature → `@apps/smart-pocket-mobile/README.md`
- Set up Cloudflare Tunnel → `@README.md`
- Fix failing container → `@infrastructure/docker/DOCKER_GUIDE.md`
- Enable hot reload → `@infrastructure/docker/DOCKER_GUIDE.md`

---

## 📝 Pull Request Standards

### PR Title Format
**Must follow Conventional Commits**: https://www.conventionalcommits.org/

**Format**: `<type>(<scope>): <subject>`

**Examples**:
- `feat(auth): add remember-me checkbox`
- `fix(backend): remove /api prefix from routes`
- `refactor(mobile): simplify auth flow`
- `docs(ci): update deployment guide`
- `test(sheets-sync): add integration tests`

**Valid types**: feat, fix, refactor, perf, test, docs, style, chore, ci

### PR Body Format
**Must follow** `@.github/pull_request_template.md`

**Required sections**:
1. **Summary** - One or two sentences describing the change
2. **Motivation** - Why is this change needed? Include issue links/context
3. **Testing** - How was this tested? Provide steps and results
4. **Release Notes** (optional) - Any notes for the release process

**Template file**: `@.github/pull_request_template.md`

### When Creating a PR
Whether creating directly on GitHub or via `gh pr create`:
1. ✅ **Title**: Always use Conventional Commits format
2. ✅ **Body**: Always follow the pull_request_template.md sections
3. ❌ Don't: Mix custom formats or skip sections
4. ❌ Don't: Use vague titles like "fixes stuff" or "updates"

---

## 🚀 CI/CD & Release Guide

**Start Here**: `@cicd/AGENTS.md` (5-minute quick reference)  
**Deep Dive**: `@cicd/README.md` (comprehensive workflow guide)

### The Workflow

```
Feature → Develop → RC (test) → Main (production)
```

**RC (Release Candidate) Strategy**:
- Create `rc/vX.X.X` branches for testing
- Test in beta/staging environments
- Merge to `main` only from `rc/*` branches
- Production deployment is automatic

### Quick Release Process

```bash
# 1. Feature development (normal)
git checkout -b feature/my-feature develop
# ... make changes ...
git push origin feature/my-feature
# Create PR to develop

# 2. Create Release Candidate when ready
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch
git checkout -b rc/v1.0.5
git push origin rc/v1.0.5
# → Builds + test deployment (~60 min)
# → Test in TestFlight/beta

# 3. Release to Production
gh pr create --base main --head rc/v1.0.5
# → Merge PR
# → Production deployment triggers (~80 min)
```

### Key Points

- ✅ Test deployments on RC branches (Docker 'qa', TestFlight/beta)
- ✅ Only `rc/*` branches can merge to main (enforced)
- ✅ Backend & mobile always same version
- ✅ When bumping mobile version: also update `@apps/smart-pocket-mobile/app.config.js` line 75
- ✅ ~82% reduction in Actions minutes
- ✅ Automatic RC branch cleanup after merge

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

1. **Read**: `@infrastructure/docker/DOCKER_GUIDE.md`
2. **Edit**: `@infrastructure/docker/Backend.dev.dockerfile`
3. **Update**: `@docker-compose.yml` if needed
4. **Rebuild**: `docker-compose build --no-cache`
5. **Test**: `docker-compose up`

### Task: Debug Container Issues

1. **Read**: `@infrastructure/docker/DOCKER_GUIDE.md` (Troubleshooting section)
2. **Check Logs**: `docker-compose logs smart-pocket-backend`
3. **Access Container**: `docker exec -it smart-pocket-backend sh`
4. **Verify Volumes**: Check `docker-compose.yml` volume mounts
5. **Rebuild**: `docker-compose build --no-cache`

### Task: Add Environment Variable

1. **Edit**: `@.env.example` (add with documentation)
2. **Edit**: `@.env` (add actual value)
3. **Reference**: In code via `process.env.YOUR_VAR`
4. **Test**: Start container: `docker-compose up`

### Task: Create a Release Candidate & Deploy

**⚠️ CRITICAL CHECKLIST - DO NOT SKIP ANY STEPS**

#### Phase 1: Version Bumping (on develop branch)

⚠️ **CRITICAL**: Only bump versions for apps/libs that **actually changed**.  
Example: If only web app gets a feature, only bump @apps/smart-pocket-web version.

1. ✅ **Switch to develop**: `git checkout develop && git pull origin develop`
2. ✅ **Identify affected apps**: Check what changed in this release
   - Backend feature/fix? → Bump `@apps/smart-pocket-backend` version
   - Mobile feature/fix? → Bump `@apps/smart-pocket-mobile` version (package.json + app.config.js)
   - Web feature/fix? → Bump `@apps/smart-pocket-web` version
   - ❌ **Don't**: Bump all apps if only one changed
3. ✅ **Bump affected app versions**: Example for web only:
   ```bash
   npm --prefix apps/smart-pocket-web version patch  # Only if web changed
   # Don't bump backend or mobile if they didn't change
   ```
4. ✅ **Update mobile app.config.js** (if mobile changed): Edit `@apps/smart-pocket-mobile/app.config.js` line 75
   - Change: `version: '1.1.0'` → `version: '1.1.2'` (match package.json)
   - ⚠️ **This is easy to forget but critical for TestFlight builds**
   - Only needed if mobile version was bumped
5. ✅ **Verify version consistency**:
   ```bash
   # Check which apps have versions
   grep '"version"' apps/*/package.json
   grep "version:" apps/smart-pocket-mobile/app.config.js  # If mobile changed
   # All bumped apps should have matching versions
   ```
6. ✅ **Commit with Conventional Commits format**:
   ```bash
   # Example: only web changed
   git add apps/smart-pocket-web/package.json
   git commit -m "chore: bump web app version to 1.1.2

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
   
   # Or: multiple apps changed
   git add apps/smart-pocket-{backend,mobile}/package.json apps/smart-pocket-mobile/app.config.js
   git commit -m "chore: bump backend and mobile versions to 1.1.2

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
   ```

#### Phase 2: RC Branch Creation

7. ✅ **Create RC branch**: `git checkout -b rc/v1.1.2 && git push origin rc/v1.1.2`
8. ✅ **Monitor Builds**: Check GitHub Actions for test deployment (~60 minutes)
   - Watch for Docker builds and TestFlight uploads
9. ✅ **Test in Beta**: Test features in TestFlight/beta environments

#### Phase 3: Production Release (when ready)

10. ✅ **Create PR to main** with **PROPER TEMPLATE**:
    ```bash
    gh pr create --base main --head rc/v1.1.2
    ```
11. ✅ **PR TITLE**: Must follow **Conventional Commits** format
    - Example: `feat(web): implement refresh token support`
    - Valid types: feat, fix, refactor, perf, test, docs, style, chore, ci
    - Format: `<type>(<scope>): <subject>`
    - ❌ BAD: "update stuff", "fix things", "PR merge"
12. ✅ **PR BODY**: Must follow **pull_request_template.md** sections:
    - **Summary** - One or two sentences
    - **Motivation** - Why this change? Link issues/context
    - **Testing** - How was it tested? Steps and results
    - **Release Notes** (optional) - Notes for release process
    - ⚠️ **Do NOT use custom format** - Always use template
13. ✅ **Merge PR**: Triggers production deployment (~80 minutes)
    - Only `rc/*` branches can merge to main (enforced by workflow)
    - RC branch auto-cleans after merge

**Reference Docs**:
- PR Standards: `@AGENTS.md` § Pull Request Standards (lines 444-477)
- Mobile version rule: `@apps/smart-pocket-mobile/AGENTS.md` line 650
- Template file: `@.github/pull_request_template.md`
- Detailed CI/CD: `@cicd/README.md`

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
| Docker Documentation | `@infrastructure/docker/DOCKER_GUIDE.md` |
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
- Working with Docker? → Read `@infrastructure/docker/DOCKER_GUIDE.md`
- Developing mobile? → Read `@apps/smart-pocket-mobile/README.md`

---

**Last Updated**: 2026-03-27  
**Status**: Complete and maintained  
**For**: Developers and AI Agents
