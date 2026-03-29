# CI/CD Quick Guide for Developers & AI Agents

**Purpose**: Quick reference for the RC (Release Candidate) branching strategy and CI/CD workflows.

---

## 🎯 The Workflow

```
Feature Branch → Develop → RC Branch (rc/vX.X.X) → Main (Production)
    (PR)         (merge)       (test env)             (prod env)
```

### Key Points
- ✅ **RC branches** create test deployments (Docker 'qa' tag, TestFlight/beta)
- ✅ **Only rc/* PRs** can merge to main (strictly enforced)
- ✅ **Version sync**: Both backend & mobile at same version
- ✅ **Auto-cleanup**: RC branches delete after merge
- ✅ **Saves credits**: ~70-80% reduction in Actions minutes

---

## 📋 Daily Workflow

### 1. Feature Development
```bash
# Create feature branch from develop
git checkout -b feature/my-feature develop
git push origin feature/my-feature

# Create PR to develop
# → Lightweight checks run (~5 min): lint, build
# → Merge when ready
```

### 2. Release (When Ready)
```bash
# Bump both versions (must match)
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch

# Create RC branch with version
git checkout -b rc/v1.0.5 develop
git push origin rc/v1.0.5

# → Full builds + test deploy (~60 min)
# → Backend Docker image tagged 'qa'
# → Mobile deployed to TestFlight/beta
```

### 3. Production Release
```bash
# Create PR: rc/v1.0.5 → main
# → Enforcement checks run (~5 min)
# → Merge PR

# → Production deploy triggers (~80 min)
# → Docker: 'latest' + 'v1.0.5' tags
# → Mobile: Production stores
# → RC branch auto-deleted
```

---

## 🔀 Branch Rules

| Branch | Source | Destination | Checks | Deployment |
|--------|--------|-------------|--------|------------|
| feature/* | - | develop | Lightweight (lint, build) | None |
| develop | feature/* | - | None | None |
| rc/vX.X.X | develop | main | Full build + version check | Test (qa tag) |
| main | rc/* only | - | Enforcement only | Production |

---

## 📦 Workflows

### `pr-base-checks.yml`
- **Trigger**: PR to main
- **Enforces**: Source must be rc/* branch only
- **Time**: ~5 min

### `pr-develop-checks.yml`
- **Trigger**: PR to develop
- **Checks**: Lint, TypeScript, mobile prebuild
- **Time**: ~5 min

### `pr-main-build.yml`
- **Trigger**: PR to main (from rc/* branches)
- **Builds**: Full Docker builds, full mobile builds
- **Tests**: Run if configured
- **Time**: ~60 min

### `pr-orchestrator.yml`
- **Trigger**: Merge to main
- **Deploys**: Backend (latest + version tags), Mobile (production)
- **Cleanup**: Auto-delete RC branch
- **Time**: ~80 min

---

## 🚨 Common Tasks

### I pushed to rc/v1.0.5 but version mismatch error

```bash
# Check versions
grep '"version"' apps/smart-pocket-backend/package.json
grep '"version"' apps/smart-pocket-mobile/package.json

# Update if needed
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch

# Commit and push
git add apps/*/package.json
git commit -m "chore: sync versions for rc/v1.0.5"
git push
```

### I want to retry RC testing with new version

```bash
# Bump version (creates new version, not v1.0.5)
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch

# Create new RC branch
git checkout develop
git pull
git checkout -b rc/v1.0.6
git push origin rc/v1.0.6
```

### I accidentally pushed to main

This should be blocked by CI if branch protection is enabled. If not:
```bash
# Revert the commit
git revert HEAD
git push origin main
```

---

## 💰 Credit Usage

| Stage | Time | Frequency | Monthly | Why |
|-------|------|-----------|---------|-----|
| Feature PR checks | 5 min | 8x/week | ~40 min | Lightweight |
| RC build/deploy | 60 min | 1x/week | ~60 min | Full builds, test |
| PR main checks | 5 min | 1x/week | ~5 min | Enforcement |
| Production deploy | 80 min | 1x/week | ~80 min | Full builds, prod |
| **Total** | — | — | **~185 min** | 82% savings |

---

## 📖 For More Details

See `/cicd/README.md` for:
- Detailed workflow explanations
- Docker tagging strategy
- Version management rules
- Branch protection setup
- Troubleshooting guide

---

**Last Updated**: 2026-03-29  
**Status**: Current CI/CD Strategy
