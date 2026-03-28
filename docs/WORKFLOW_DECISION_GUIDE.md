# Workflow Decision Guide

> Quick reference to help you choose the right CI/CD workflow for Smart Pocket

---

## 🎯 Quick Decision Matrix

### Which workflow is right for you?

| Need | Option 1 | Option 2 | Option 3 | Option 4 |
|------|----------|----------|----------|----------|
| **Simple & Easy** | ✅ Best | ⚠️ Medium | ⚠️ Medium | ❌ Complex |
| **Save Credits** | ✅ Best | ❌ Most cost | ✅ Good | ❌ Most cost |
| **Dedicated QA Phase** | ❌ No | ✅ Yes | ⚠️ Via tags | ✅ Yes |
| **Version Management** | ⚠️ Manual | ⚠️ Manual | ✅ Built-in | ✅ Built-in |
| **Team Size** | Small/Solo | Medium | Small/Medium | Large |
| **Release Frequency** | Any | Any | Weekly+ | Any |

---

## 💡 Choose Your Scenario

### Scenario 1: Solo Developer, Minimizing Costs
→ **Option 1: Simple Tier** + **Versioned Releases**

**Your workflow:**
```bash
# Development
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
# Create PR to develop
# ✅ Lightweight checks run (lint, prebuild)
# ...review & merge...

# Release (once a week/month)
npm version patch  # in both apps/smart-pocket-backend & apps/smart-pocket-mobile
git tag v1.0.2
git push origin v1.0.2
# 🚀 Full builds + deployment triggered automatically
```

**Actions Budget**: ~200 minutes/month (low)
**Implementation Time**: 1-2 weeks

---

### Scenario 2: Small Team, Need QA Gate
→ **Option 2: With Dedicated Staging Branch**

**Your workflow:**
```bash
# Feature development (same as above)
git checkout -b feature/auth

# Create PR to develop
# ✅ Checks: lint, prebuild

# When ready for QA
git checkout develop && git pull
git checkout -b release/v1.0.2
# ...final touches...
git push origin release/v1.0.2

# Create PR: release/v1.0.2 → staging
# 🧪 Full QA build triggers
# ...team tests...

# Create PR: staging → main
# 🚀 Production deployment triggers
```

**Actions Budget**: ~500 minutes/month (moderate)
**Implementation Time**: 2-3 weeks
**Team Size**: 2-5 people

---

### Scenario 3: Medium Team, Clear Versioning Needed
→ **Option 3: Versioned Release Branches + Main** (Recommended for you)

**Your workflow:**
```bash
# Daily development
git checkout -b feature/new-api-endpoint
# ...work & commit...

# PR to develop (multiple people doing this)
git push origin feature/new-api-endpoint
# Create PR develop ← feature/new-api-endpoint
# ✅ Lightweight checks: lint + prebuild
# ...code review...
# 👍 Merge to develop

# Create release (once decision is made to release)
# 1. Bump versions in both package.json files
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch

# 2. Commit
git add apps/*/package.json
git commit -m "chore: bump to v1.0.2"
git push origin develop

# 3. PR: develop → main
# 🧪 Full builds run
# ...final validation...
# Merge to main

# 4. Tag for release
git tag v1.0.2
git push origin v1.0.2
# 🚀 Deployment workflow triggers
```

**Actions Budget**: ~300 minutes/month (low-moderate)
**Implementation Time**: 2-3 weeks
**Team Size**: 2-8 people
**Release Schedule**: Flexible (on-demand)

---

### Scenario 4: Large Team, Enterprise Setup
→ **Option 4: Hybrid (Develop + Staging + Versions)**

**Your workflow**: (Most formal process)
```bash
# Feature branch → develop (lightweight checks)
# develop → staging (full builds, QA testing, 3-5 days)
# staging → main (production deployment)
# Tag main with version (v1.0.2)
```

**Actions Budget**: ~800+ minutes/month (high)
**Implementation Time**: 3-4 weeks
**Team Size**: 8+ people
**Governance**: Strict release process

---

## 🚀 Implementation Checklist

### For Option 1/3 (Recommended)

- [ ] **Update `.github/workflows/pr-base-checks.yml`**
  - ✅ Already enforces: develop → main only

- [ ] **Create `.github/workflows/pr-develop-checks.yml`** (NEW)
  - Runs on PR to develop
  - Lint, TypeScript, prebuild (lightweight)

- [ ] **Create `.github/workflows/pr-main-build.yml`** (NEW)
  - Runs on PR to main
  - Full Docker builds, mobile builds

- [ ] **Create `.github/workflows/release.yml`** (NEW)
  - Triggers on version tags (v1.*.*)
  - Deploy to production
  - Create GitHub Release

- [ ] **Update `package.json` versions**
  - apps/smart-pocket-backend/package.json
  - apps/smart-pocket-mobile/package.json

- [ ] **Update branch protection rules**
  - main: require PR from develop only
  - develop: require checks to pass
  - Add required reviewers

- [ ] **Create RELEASE.md** in docs/
  - Step-by-step release instructions
  - Commit message templates
  - Version bump process

---

## 📋 Quick Reference Card

### Daily Development
```bash
# Create feature branch
git checkout -b feature/my-feature develop

# Make changes and push
git add .
git commit -m "feat: add user authentication"
git push origin feature/my-feature

# Create PR to develop (GitHub UI)
# - Lightweight checks run automatically ✅
# - Wait for approval
# - Merge to develop
```

### Release Process (When Ready)
```bash
# Option A: Using npm version (easiest)
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch
git add apps/*/package.json
git commit -m "chore: bump to v1.0.2"
git push origin develop

# Then create PR: develop → main
# After merge, tag for release:
git tag v1.0.2
git push origin v1.0.2
# 🚀 Everything deploys automatically!

# Option B: Manual versioning (more control)
# Edit: apps/smart-pocket-backend/package.json (version: 1.0.2)
# Edit: apps/smart-pocket-mobile/package.json (version: 1.0.2)
# git add, commit, push, tag (same as above)
```

### Emergency Hotfix
```bash
# Create hotfix from main (not develop)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Make minimal fix
git commit -m "fix: critical production bug"
git push origin hotfix/critical-bug

# Create PR to main
# After merge, create tag: v1.0.1-hotfix1
# Also cherry-pick changes to develop:
git checkout develop
git cherry-pick hotfix/critical-bug
git push origin develop
```

---

## 🎯 Decision: Which Option Should We Pick?

### For Smart Pocket, I Recommend: **Option 1 (Simple) + Versioned Releases**

**Reasoning:**
1. ✅ You're a small team → don't need complex staging
2. ✅ You're cost-conscious → versioned releases = no duplicate builds
3. ✅ Monorepo benefit → synchronized versions for mobile + backend
4. ✅ Easy to understand → feature → develop → main → tag (linear)
5. ✅ Future-proof → can scale to Option 4 later if needed

**Costs:**
- Easy setup (2-3 weeks)
- Clear daily workflow
- ~70% credit savings vs. building on every push
- Simple version management
- Easy team onboarding

**Next Steps:**
1. Review this guide with your team
2. Confirm version synchronization strategy
3. Create the new workflow files
4. Test on `ci-checks` branch
5. Deploy to main

---

## 🚨 Gotchas & Tips

### Gotcha 1: Forgetting to Bump Both Versions
**Problem**: Mobile at v1.0.2, backend at v1.0.1 → version mismatch
**Prevention**: Use npm version bump in both folders simultaneously
```bash
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch
```

### Gotcha 2: Tag Pushed Before Package.json Committed
**Problem**: Tag points to old code, version mismatch in git history
**Prevention**: Always commit version bumps BEFORE creating tag
```bash
# ✅ Correct order:
git add apps/*/package.json
git commit -m "chore: bump to v1.0.2"
git push origin develop
# ...merge PR to main...
git tag v1.0.2  # Tag AFTER version commits are in main
git push origin v1.0.2

# ❌ Wrong order:
git tag v1.0.2  # Don't tag yet!
git add apps/*/package.json
git commit -m "chore: bump to v1.0.2"
```

### Gotcha 3: Hotfix Not Getting Back to Develop
**Problem**: Fix production, but forgot to merge back to develop
**Solution**: Hotfix checklist always includes: fix → main → develop
```bash
# Always do both:
git push hotfix/bug to main  # Fix production
git cherry-pick to develop   # Sync back
```

### Gotcha 4: Actions Still Running on Develop Pushes
**Problem**: "I thought you were saving credits!"
**Prevention**: Use conditional job execution
```yaml
on:
  push:
    branches: [develop]
    paths:
      - 'apps/smart-pocket-backend/**'  # Only run if backend changed
      - '.github/workflows/backend*.yml'
```

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| "How do I rollback to v1.0.1?" | `git checkout v1.0.1 && git pull && deploy` |
| "Can I skip PR checks?" | No (branch protection enforces), but you can run locally: `npm run lint && npm run build` |
| "What if my PR is breaking?" | Create new commit fixing the issue, push to same branch, PR auto-updates |
| "How long do releases take?" | Full builds: 30-40 minutes (mobile) + 15-20 minutes (backend) = ~50-60 min total |
| "Can multiple people develop same feature?" | Yes, create separate PRs or collaborate on feature branch |
| "How do I test staging before merging to main?" | Either: A) Test on `main` PR, or B) Maintain `staging` branch for testing |

---

## 📊 Final Checklist

Before implementing, confirm:

- [ ] Team agrees on chosen workflow option
- [ ] Version synchronization strategy defined
- [ ] Release schedule established (weekly, monthly, on-demand?)
- [ ] Hotfix process documented
- [ ] Branch protection rules ready
- [ ] GitHub Actions quota sufficient
- [ ] All developers understand process
- [ ] Rollback procedure tested
- [ ] `docs/RELEASE.md` created with steps
- [ ] Automated version bumping (npm version) preferred over manual

---

**Ready to implement?** → See `CI_CD_WORKFLOWS.md` for detailed workflow implementations.

**Want to visualize your flow?** → Check out the Mermaid diagrams in the main guide.

**Questions?** → Create an issue or discussion in GitHub.
