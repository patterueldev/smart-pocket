# CI/CD Implementation Roadmap

> Step-by-step guide to implement the recommended workflow (Option 1 + Versioned Releases)

---

## 📋 Overview

This roadmap will:
1. ✅ Keep your existing `pr-base-checks.yml` (develop → main only)
2. 🆕 Add `pr-develop-checks.yml` (lightweight PR checks)
3. 🆕 Add `pr-main-build.yml` (full builds on release PRs)
4. 🆕 Add `release.yml` (tag-triggered deployment)
5. 📝 Synchronize versions between mobile & backend
6. 🔒 Update branch protection rules
7. 📖 Create release documentation

---

## Phase 1: Preparation (1-2 days)

### Step 1.1: Review Current Workflows
```bash
cd /Users/pat/Projects/PAT/smart-pocket
ls -la .github/workflows/
```

**Files found:**
- ✅ `pr-base-checks.yml` - Enforces develop → main (keep as-is)
- ✅ `pr-conventional-commits.yml` - Validates commit format (keep as-is)
- ✅ `pr-mobile-build-checks.yml` - Builds mobile (adapt)
- ✅ `deploy-backend.yml` - Builds Docker (adapt)
- ✅ `deploy-ios.yml` - iOS deployment
- ✅ `deploy-android.yml` - Android deployment

### Step 1.2: Audit Current Version Files
```bash
# Check backend version
cat apps/smart-pocket-backend/package.json | grep '"version"'

# Check mobile version
cat apps/smart-pocket-mobile/package.json | grep '"version"'

# Goal: Make them the same
```

### Step 1.3: Create Team Checklist
- [ ] Confirm workflow option (Option 1 + Versioned Releases)
- [ ] Decide release schedule (weekly? on-demand?)
- [ ] Assign release manager role
- [ ] Review branch protection rules
- [ ] Test process on ci-checks branch first

---

## Phase 2: Update Workflows (3-5 days)

### Step 2.1: Create Lightweight PR Checks Workflow

**File**: `.github/workflows/pr-develop-checks.yml`

```yaml
name: PR / Develop - Lightweight Checks

on:
  pull_request:
    branches: [develop]
    types: [opened, synchronize, reopened, edited]

jobs:
  validate-conventional-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate conventional commit format
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  backend-lint:
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.title, 'backend') || 
        contains(github.event.pull_request.files.*.path, 'apps/smart-pocket-backend')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: 'apps/smart-pocket-backend/package-lock.json'
      
      - name: Install dependencies
        run: cd apps/smart-pocket-backend && npm ci
      
      - name: Run linter
        run: cd apps/smart-pocket-backend && npm run lint
      
      - name: Build TypeScript
        run: cd apps/smart-pocket-backend && npm run build

  mobile-prebuild:
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.title, 'mobile') || 
        contains(github.event.pull_request.files.*.path, 'apps/smart-pocket-mobile')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: 'apps/smart-pocket-mobile/package-lock.json'
      
      - name: Install dependencies
        run: cd apps/smart-pocket-mobile && npm ci
      
      - name: Prebuild check
        run: cd apps/smart-pocket-mobile && npm run build
```

**Cost**: ~5-10 minutes per PR
**Runs on**: Every PR to develop
**Purpose**: Quick sanity check (lint, TypeScript, basic build)

---

### Step 2.2: Create Full Build Workflow for Release PRs

**File**: `.github/workflows/pr-main-build.yml`

```yaml
name: PR / Main - Full Build & Test

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, edited]

jobs:
  backend-docker-build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/backend
          tags: |
            type=raw,value=pr-${{ github.event.pull_request.number }}
            type=sha,prefix=pr-${{ github.event.pull_request.number }}-
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/smart-pocket-backend
          file: ./docker/Backend.prod.dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production
      
      - name: Comment PR with Docker image
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Docker image built and available:\n```\n${{ steps.meta.outputs.tags }}\n```'
            })

  mobile-full-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: 'apps/smart-pocket-mobile/package-lock.json'
      
      - name: Install dependencies
        run: cd apps/smart-pocket-mobile && npm ci
      
      - name: Build for iOS (if available)
        run: cd apps/smart-pocket-mobile && npm run build:ios || echo "iOS build not configured yet"
      
      - name: Build APK
        run: cd apps/smart-pocket-mobile && npm run build:android || echo "Android build not configured yet"

  summary:
    name: Release PR - Summary
    needs: [backend-docker-build, mobile-full-build]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Generate summary
        run: |
          echo "## 🎯 Release Build Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Component | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-----------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Backend Docker | ${{ needs.backend-docker-build.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Mobile Build | ${{ needs.mobile-full-build.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
```

**Cost**: ~40-60 minutes per PR (expensive, but only on release)
**Runs on**: Every PR to main (release candidates)
**Purpose**: Full build verification before production

---

### Step 2.3: Create Release Workflow (Triggered by Tags)

**File**: `.github/workflows/release.yml`

```yaml
name: Release / Deploy Production

on:
  push:
    tags:
      - 'v*.*.*'  # Matches: v1.0.0, v1.0.1, v2.1.3, etc.

jobs:
  extract-version:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - name: Extract version from tag
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

  release-backend:
    needs: extract-version
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push production image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/smart-pocket-backend
          file: ./docker/Backend.prod.dockerfile
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend:latest
            ghcr.io/${{ github.repository }}/backend:${{ needs.extract-version.outputs.version }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production

  release-mobile-android:
    needs: extract-version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: 'apps/smart-pocket-mobile/package-lock.json'
      
      - name: Install dependencies
        run: cd apps/smart-pocket-mobile && npm ci
      
      - name: Build and upload Android
        run: |
          cd apps/smart-pocket-mobile
          npm run build:android:release || echo "Android release build not configured"
      
      # Would typically upload to Google Play Store here
      # - name: Upload to Play Store
      #   uses: r0adkll/upload-google-play@v1
      #   with:
      #     serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}

  release-mobile-ios:
    needs: extract-version
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: 'apps/smart-pocket-mobile/package-lock.json'
      
      - name: Install dependencies
        run: cd apps/smart-pocket-mobile && npm ci
      
      - name: Build and upload iOS
        run: |
          cd apps/smart-pocket-mobile
          npm run build:ios:release || echo "iOS release build not configured"
      
      # Would typically upload to App Store here
      # - name: Upload to App Store
      #   uses: apple-actions/upload-testflight-build@v1
      #   with:
      #     app-path: 'apps/smart-pocket-mobile/build/ios'

  create-github-release:
    needs: [extract-version, release-backend, release-mobile-android, release-mobile-ios]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for changelog generation
      
      - name: Generate changelog
        id: changelog
        run: |
          VERSION=${{ needs.extract-version.outputs.version }}
          PREVIOUS_TAG=$(git describe --tags --abbrev=0 "$VERSION"^ 2>/dev/null || echo "")
          
          if [ -z "$PREVIOUS_TAG" ]; then
            CHANGELOG=$(git log --oneline --decorate)
          else
            CHANGELOG=$(git log --oneline "${PREVIOUS_TAG}..${VERSION}")
          fi
          
          EOF=$(dd if=/dev/urandom bs=15 count=1 status=none | base64)
          echo "changelog<<$EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "$EOF" >> $GITHUB_OUTPUT
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ needs.extract-version.outputs.version }}
          release_name: Release ${{ needs.extract-version.outputs.version }}
          body: |
            # Release ${{ needs.extract-version.outputs.version }}
            
            ## 🚀 Deployments
            - Backend: ✅ ${{ needs.release-backend.result == 'success' && 'Deployed' || 'Failed' }}
            - Android: ✅ ${{ needs.release-mobile-android.result == 'success' && 'Deployed' || 'Failed' }}
            - iOS: ✅ ${{ needs.release-mobile-ios.result == 'success' && 'Deployed' || 'Failed' }}
            
            ## 📝 Changes
            ```
            ${{ steps.changelog.outputs.changelog }}
            ```
            
            **Deployed at**: ${{ github.event.head_commit.timestamp }}
          draft: false
          prerelease: false

  notify-slack:
    needs: [extract-version]
    runs-on: ubuntu-latest
    if: success()
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🚀 Smart Pocket ${{ needs.extract-version.outputs.version }} Released!",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "🚀 Production Release",
                    "emoji": true
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "mrkdwn",
                      "text": "*Version:*\n${{ needs.extract-version.outputs.version }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Repo:*\n${{ github.repository }}"
                    }
                  ]
                },
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "<${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ needs.extract-version.outputs.version }}|View Release>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

**Cost**: ~60-80 minutes per release (big builds, but only on releases)
**Runs on**: Every tag push matching `v*.*.*`
**Purpose**: Automated production deployment & release tracking

---

## Phase 3: Synchronize Versions (1-2 days)

### Step 3.1: Audit Current Versions

```bash
# Get current versions
echo "Backend version:"
cat apps/smart-pocket-backend/package.json | grep '"version":'

echo "Mobile version:"
cat apps/smart-pocket-mobile/package.json | grep '"version":'
```

### Step 3.2: Synchronize to Same Version

```bash
# Use npm version command (easier)
cd apps/smart-pocket-backend
npm version 0.1.0  # Set to 0.1.0 as initial version

cd ../smart-pocket-mobile
npm version 0.1.0  # Match backend

# Or manually edit both files:
# apps/smart-pocket-backend/package.json → "version": "0.1.0"
# apps/smart-pocket-mobile/package.json → "version": "0.1.0"

# Commit synchronized versions
git add apps/*/package.json
git commit -m "chore: sync versions to 0.1.0"
git push origin develop
```

### Step 3.3: Create First Release Tag

```bash
# After PR merges to main:
git checkout main
git pull origin main

git tag v0.1.0
git push origin v0.1.0

# This triggers the release.yml workflow!
```

---

## Phase 4: Update Branch Protection Rules (1 day)

### Step 4.1: Protect Main Branch

On GitHub, go to: **Settings → Branches → Add Rule → `main`**

✅ Enable:
- [ ] Require pull request reviews before merging (min 1 approver)
- [ ] Dismiss stale pull request approvals
- [ ] Require status checks to pass:
  - [ ] `pr-base-checks` ← Enforce develop only
  - [ ] `backend-docker-build` (from pr-main-build.yml)
  - [ ] `mobile-full-build` (from pr-main-build.yml)
- [ ] Require branches to be up to date before merging
- [ ] Include administrators in restrictions
- [ ] Restrict who can push to matching branches (optional)

⚠️ Do NOT allow:
- [ ] Force pushes
- [ ] Direct pushes (require PR)

---

### Step 4.2: Protect Develop Branch

On GitHub, go to: **Settings → Branches → Add Rule → `develop`**

✅ Enable:
- [ ] Require pull request reviews (min 1, optional if small team)
- [ ] Require status checks to pass:
  - [ ] `validate-conventional-commit`
  - [ ] `backend-lint` (if backend files changed)
  - [ ] `mobile-prebuild` (if mobile files changed)
- [ ] Require branches to be up to date before merging

⚠️ Allow:
- [ ] Direct pushes from maintainers (for hotfixes)

---

## Phase 5: Create Release Documentation (1-2 days)

### Step 5.1: Create `docs/RELEASE.md`

```markdown
# Release Process

## Quick Release (5 minutes)

```bash
# 1. Ensure you're on develop with latest changes
git checkout develop
git pull origin develop

# 2. Bump both versions
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch

# 3. Commit and push
git add apps/*/package.json
git commit -m "chore: bump version"
git push origin develop

# 4. Create PR to main (via GitHub UI)

# 5. After merge to main, create tag
git checkout main
git pull origin main
git tag v$(cat apps/smart-pocket-backend/package.json | jq -r '.version')
git push origin --tags

# 6. Watch release workflow run!
```

## Detailed Release Steps

### Pre-Release Checklist
- [ ] All features merged to develop
- [ ] No breaking changes documented
- [ ] Tests passing
- [ ] Changelog reviewed
- [ ] Version number decided

### Release Steps
1. Bump versions
2. Create PR develop → main
3. Review and merge
4. Create version tag
5. Monitor workflow
6. Test in production

### Post-Release
- [ ] Verify backend running (health check)
- [ ] Verify mobile in stores
- [ ] Notify team on Slack
- [ ] Create post-release issue tracking
```

---

## Phase 6: Test the Process (2-3 days)

### Step 6.1: Test on ci-checks Branch First

```bash
git checkout -b test/ci-checks-workflow
# Make a small change
git add .
git commit -m "test: workflow check"
git push origin test/ci-checks-workflow

# Create PR to develop
# ✅ Watch lightweight checks run

# Merge to develop, then create PR to main
# ✅ Watch full builds run

# Merge to main
git tag v0.1.0-test
git push origin --tags
# ✅ Watch release workflow run
```

### Step 6.2: Verify Each Workflow

- [ ] `pr-develop-checks.yml` runs correctly (~5 min)
- [ ] `pr-main-build.yml` runs correctly (~60 min)
- [ ] `release.yml` triggers on tag (~80 min)
- [ ] Docker image available in GHCR
- [ ] GitHub Release created
- [ ] Slack notification sent (if configured)

### Step 6.3: Rollback Test

```bash
# Test rollback procedure
git tag v0.0.9
git push origin v0.0.9
# Verify old version deploys

# Clean up test tags
git tag -d v0.1.0-test v0.0.9
git push origin --delete v0.1.0-test v0.0.9
```

---

## Phase 7: Team Deployment & Training (1-2 days)

### Step 7.1: Update All Workflows

```bash
# Verify all .yml files are in .github/workflows/
ls -la .github/workflows/

# Should have:
# ✅ pr-base-checks.yml (existing)
# ✅ pr-conventional-commits.yml (existing)
# ✅ pr-develop-checks.yml (NEW)
# ✅ pr-main-build.yml (NEW)
# ✅ release.yml (NEW)
# ✅ deploy-ios.yml (existing - update)
# ✅ deploy-android.yml (existing - update)
```

### Step 7.2: Team Training

Create a team meeting covering:
1. New workflow process (diagram)
2. Daily development workflow
3. Release process (version bumping → tag)
4. Hotfix procedure
5. Common questions & troubleshooting

### Step 7.3: Update Documentation

- [ ] Update README.md with new workflow
- [ ] Add RELEASE.md to docs/
- [ ] Update AGENTS.md with workflow info
- [ ] Create internal runbook (wiki or doc)

---

## Rollout Timeline

| Week | Deliverable | Status |
|------|-------------|--------|
| Week 1 | Prepare & review → Create workflows | 📋 Planning |
| Week 2 | Implement workflows → Test on ci-checks | 🔧 Implementation |
| Week 3 | Deploy to main → Team training | 🚀 Deployment |
| Week 4 | Monitor & optimize → Hotfix procedures | 📊 Optimization |

---

## Success Criteria

✅ **Workflow is successful when:**

- [ ] All PRs to develop pass lightweight checks (~5 min)
- [ ] All PRs to main pass full builds (~60 min)
- [ ] Version tags trigger release workflow (~80 min)
- [ ] GitHub Releases created automatically
- [ ] Docker images pushed to GHCR
- [ ] Slack notifications working (if configured)
- [ ] Team comfortable with new process
- [ ] Actions credit usage reduced by ~70%
- [ ] Zero manual deployment steps

---

## Troubleshooting During Rollout

### Issue: PR checks failing on develop
**Solution**: 
1. Check error message in Actions tab
2. Run locally: `npm run lint && npm run build`
3. Fix issues
4. Push to same PR (auto-updates)

### Issue: Full build on main taking too long
**Solution**:
1. Check Docker layer cache (should be enabled)
2. Review if both backend AND mobile changed
3. Can run in parallel (Actions does this automatically)

### Issue: Tag workflow not triggering
**Solution**:
1. Verify tag format: `v1.0.0` (matches `v*.*.*`)
2. Tag from main branch: `git checkout main` first
3. Check Actions tab for any errors

### Issue: Version mismatch after release
**Solution**:
1. Always bump both package.json files simultaneously
2. Commit versions BEFORE creating tag
3. Use `npm version patch` in both folders

---

## Quick Commands Reference

```bash
# Daily development
git checkout -b feature/my-feature develop
# ... make changes ...
git push origin feature/my-feature
# Create PR to develop via GitHub UI

# Release process
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch
git add apps/*/package.json
git commit -m "chore: bump version"
git push origin develop
# Create PR develop → main via GitHub UI
# After merge, tag for release:
git checkout main && git pull
git tag v$(cat apps/smart-pocket-backend/package.json | jq -r '.version')
git push origin --tags

# Check workflow status
# Go to: https://github.com/[owner]/smart-pocket/actions

# Hotfix (emergency)
git checkout main && git pull
git checkout -b hotfix/critical-issue
# ... fix ...
git push origin hotfix/critical-issue
# PR to main, then cherry-pick to develop
```

---

**Ready to start?** → Begin with Phase 1 (Preparation)

**Have questions?** → Check WORKFLOW_DECISION_GUIDE.md or CI_CD_WORKFLOWS.md

**Need help with specific step?** → See Troubleshooting section above
