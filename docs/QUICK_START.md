# CI/CD Quick Start

> **TL;DR** - Start here if you only have 10 minutes
> **Final Strategy**: RC (Release Candidate) branches with test deploys

---

## 🎯 The Situation

You want to:
- ✅ Build QA/testing workflows with test deployments
- ✅ Minimize GitHub Actions credits
- ✅ Have a clear, simple branching strategy
- ✅ Synchronize mobile + backend versions
- ✅ Only allow controlled releases to production

---

## 🚀 The Solution (Recommended)

**Workflow: RC (Release Candidate) Branches with Test Deployments**

```
Feature Branches → Develop → RC Branch → Main (Production)
  (dev)           (PRs)    (test env)    (prod env)
```

### Daily Workflow
```bash
# Feature development
git checkout -b feature/my-feature develop
git push origin feature/my-feature
# Create PR to develop
# ✅ Lightweight checks run (5 min, lint + build)

# When ready for testing
git checkout -b rc/v1.0.5 develop
npm --prefix apps/smart-pocket-backend version patch
npm --prefix apps/smart-pocket-mobile version patch
git add apps/*/package.json && git commit -m "rc: v1.0.5"
git push origin rc/v1.0.5
# ✅ Test deploys run (60 min)
# • Backend Docker image tagged 'qa'
# • Mobile deployed to TestFlight/beta track

# Manual testing (hours/days, no time limit)
# Test in beta environments...

# When testing passes
gh pr create --base main --head rc/v1.0.5
# ✅ Enforcement checks run (5 min)
# • PR source MUST be rc/* (not develop, not feature/*)
# • Version must increase
# Merge PR

# 🚀 Production deployment triggers (80 min)
# • Backend Docker: 'latest' + 'v1.0.5' tags
# • Mobile: Production stores
# • RC branch auto-deleted
```

---

## 💰 The Benefit

| Metric | Current | Recommended |
|--------|---------|------------|
| Actions/month | ~1,000 min | ~300 min |
| Savings | — | 70% reduction! |
| Complexity | High | Low ✅ |
| Team effort | Medium | Low ✅ |
| Testing env | None | Yes ✅ |

---

## 📖 Which Document to Read?

| Goal | Document | Time |
|------|----------|------|
| **Quick overview** | QUICK_START.md (this file) | 5 min |
| **Understand strategy** | CI_CD_WORKFLOWS.md | 15-20 min |
| **Implement it** | CI_CD_IMPLEMENTATION_ROADMAP.md | 2-3 weeks |
| **Navigate all** | README.md | 5 min |

---

## ✅ 3-Step Implementation

### Step 1: Read & Understand (2 hours)
1. Read **QUICK_START.md** (this file)
2. Review **CI_CD_WORKFLOWS.md** (understand RC strategy)
3. Confirm this is the right choice for you

### Step 2: Implement (2-3 weeks)
Follow **CI_CD_IMPLEMENTATION_ROADMAP.md**:
- Phase 1: Preparation
- Phase 2: Update Workflows
- Phase 3: Synchronize Versions
- Phase 4-7: Protection, Testing, Deployment

### Step 3: Deploy & Train (1 week)
- Deploy workflows to main
- Train yourself on new process
- Monitor Actions savings

---

## 🔄 Current Branches (You Have)

```
main          ← Production
develop       ← Where you develop now
mobile        ← Mobile work (optional)
backend       ← Backend work (optional)
ci-checks     ← For testing workflows
rc/vX.X.X     ← Release candidates (temporary)
```

---

## 📋 Quick Checklist Before Starting

- [ ] Read WORKFLOW_DECISION_GUIDE.md
- [ ] Team agrees on this workflow option
- [ ] Understand git tags for releases
- [ ] Know how to bump versions in both package.json
- [ ] GitHub Actions quota sufficient

---

## 🆘 Quick Help

**Q: Will this really save 70% Actions credits?**  
A: Yes! By only building on releases, not every push.

**Q: Is this workflow standard?**  
A: Yes, this is GitHub Flow + semantic versioning.

**Q: Can I change my mind later?**  
A: Yes, these are just GitHub Actions + branch rules.

**Q: How long does full deployment take?**  
A: ~80 minutes total (mobile + backend builds).

**Q: What if I need to hotfix production?**  
A: Branch from main, fix, PR to main, cherry-pick to develop.

---

## 🏃 Start Now

1. Open: `docs/CI_CD_WORKFLOWS.md`
2. Read the final RC workflow section
3. Understand the test deploy strategy
4. Review the 4 workflow files
5. Then proceed to: `docs/CI_CD_IMPLEMENTATION_ROADMAP.md`

---

## 📞 Questions?

Each document has a troubleshooting section. Check:
- **WORKFLOW_DECISION_GUIDE.md** → "Gotchas & Tips"
- **CI_CD_IMPLEMENTATION_ROADMAP.md** → "Troubleshooting"

---

**Ready?** → Open `docs/WORKFLOW_DECISION_GUIDE.md` next
