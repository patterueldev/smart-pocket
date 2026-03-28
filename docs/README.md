# Smart Pocket CI/CD Documentation

> Central hub for CI/CD workflow documentation

---

## 🎯 TL;DR - Final Strategy

**RC (Release Candidate) Branches with Test Deployments**

```
Develop Branch → rc/vX.X.X (test deploy) → main (prod deploy)
```

- ✅ RC branches deploy to testing environments (Docker 'qa' tag, TestFlight/beta)
- ✅ Only rc/* can merge to main (strictly enforced)
- ✅ Production deployment with Docker 'latest' tag
- ✅ RC branches auto-delete after merge
- ✅ 70-80% Actions credit savings

**See**: `CI_CD_WORKFLOWS.md` for complete explanation

---

## 📚 Documentation Index

### Getting Started
- **[README.md](../README.md)** - Project setup and initial configuration
- **[.env.example](../.env.example)** - Environment variable template

### Development Guides
- **[AGENTS.md](../AGENTS.md)** - Master developer guide with project structure
- **[apps/smart-pocket-backend/AGENTS.md](../apps/smart-pocket-backend/AGENTS.md)** - Backend API development
- **[apps/smart-pocket-mobile/AGENTS.md](../apps/smart-pocket-mobile/AGENTS.md)** - Mobile app development
- **[docker/DOCKER_GUIDE.md](../docker/DOCKER_GUIDE.md)** - Docker and containerization

### CI/CD & Workflow Guides (NEW)
- **[CI_CD_WORKFLOWS.md](./CI_CD_WORKFLOWS.md)** - Comprehensive workflow options analysis (15+ pages)
- **[WORKFLOW_DECISION_GUIDE.md](./WORKFLOW_DECISION_GUIDE.md)** - Quick reference for choosing a workflow
- **[CI_CD_IMPLEMENTATION_ROADMAP.md](./CI_CD_IMPLEMENTATION_ROADMAP.md)** - Step-by-step implementation guide

### Architecture & Services
- **[apps/smart-pocket-mobile/AUTH_IMPLEMENTATION.md](../apps/smart-pocket-mobile/AUTH_IMPLEMENTATION.md)** - Mobile auth system
- **[apps/smart-pocket-mobile/SERVICES_REFACTORING.md](../apps/smart-pocket-mobile/SERVICES_REFACTORING.md)** - Service layer architecture
- **[apps/smart-pocket-mobile/ARCHITECTURE.md](../apps/smart-pocket-mobile/ARCHITECTURE.md)** - Mobile app architecture

---

## 🎯 Which Document Should I Read?

### I want to...

| Goal | Document |
|------|----------|
| Set up Smart Pocket for the first time | [README.md](../README.md) |
| Understand project structure | [AGENTS.md](../AGENTS.md) |
| Develop backend API features | [apps/smart-pocket-backend/AGENTS.md](../apps/smart-pocket-backend/AGENTS.md) |
| Build mobile app features | [apps/smart-pocket-mobile/AGENTS.md](../apps/smart-pocket-mobile/AGENTS.md) |
| Work with Docker containers | [docker/DOCKER_GUIDE.md](../docker/DOCKER_GUIDE.md) |
| **Understand CI/CD workflow options** | **[CI_CD_WORKFLOWS.md](./CI_CD_WORKFLOWS.md)** |
| **Quickly choose a workflow** | **[WORKFLOW_DECISION_GUIDE.md](./WORKFLOW_DECISION_GUIDE.md)** |
| **Implement the recommended workflow** | **[CI_CD_IMPLEMENTATION_ROADMAP.md](./CI_CD_IMPLEMENTATION_ROADMAP.md)** |

---

## 🆕 What's New: CI/CD Documentation

We've created **comprehensive guides** for your final CI/CD workflow strategy:

### 1️⃣ **QUICK_START.md** (10-Minute Overview) ⭐ START HERE
> 📖 **Read this if**: You want a quick overview
> ⏱️ **Time**: 5-10 minutes
> 📊 **Includes**: 
> - RC workflow overview
> - Daily workflow examples
> - Cost breakdown
> - Quick reference

### 2️⃣ **CI_CD_WORKFLOWS.md** (Complete Strategy Guide)
> 📖 **Read this if**: You want to understand the RC strategy deeply
> ⏱️ **Time**: 20-30 minutes
> 📊 **Includes**: 
> - Why RC branches work
> - Test deployments strategy
> - Docker tagging approach
> - Version management
> - Actions credit analysis

### 3️⃣ **CI_CD_IMPLEMENTATION_ROADMAP.md** (Step-by-Step)
> 📖 **Read this if**: You're ready to implement
> ⏱️ **Time**: Implementation takes 2-3 weeks
> 📊 **Includes**:
> - 7 implementation phases
> - Complete YAML workflow files (4 workflows)
> - Branch protection setup
> - Testing procedures
> - Troubleshooting guide



## 📊 Actions Credit Savings

Current setup (building on every push):
- ~1000+ minutes/month

Recommended setup (building only on releases):
- ~300 minutes/month

**Savings: ~70% reduction in Actions minutes**

---

## 🚀 Quick Start: Recommended Path

If you agree with the recommendation above, here's the fastest path:

### Phase 1: Read & Decide (2 hours)
1. Read [WORKFLOW_DECISION_GUIDE.md](./WORKFLOW_DECISION_GUIDE.md) (quick decision)
2. Confirm with team
3. Review [CI_CD_WORKFLOWS.md](./CI_CD_WORKFLOWS.md) for details

### Phase 2: Implement (2-3 weeks)
1. Follow [CI_CD_IMPLEMENTATION_ROADMAP.md](./CI_CD_IMPLEMENTATION_ROADMAP.md)
2. Implement in phases
3. Test each phase

### Phase 3: Deploy & Monitor (1 week)
1. Deploy to main
2. Train team
3. Monitor Actions credit savings

---

## 🔄 Current Project Branches

```
main          ← Production (enforce develop-only PRs)
develop       ← Integration branch (lightweight PR checks)
mobile        ← Mobile-specific development
backend       ← Backend-specific development
ci-checks     ← For testing CI/CD workflows
feature/*     ← Feature branches (daily development)
```

**Enforce with branch protection rules** (see implementation roadmap)

---

## ✅ Implementation Checklist

Before implementing, confirm:

- [ ] Read QUICK_START.md (understand overview)
- [ ] Read CI_CD_WORKFLOWS.md (understand RC strategy)
- [ ] Confirm RC (Release Candidate) approach is right for you
- [ ] Understand test deployments (Docker 'qa', TestFlight/beta)
- [ ] Confirm only rc/* branches can merge to main
- [ ] Review all 4 workflow YAML files
- [ ] GitHub Actions quota sufficient

---

## 📞 Questions?

| Topic | See |
|-------|-----|
| "What is the RC workflow?" | CI_CD_WORKFLOWS.md (complete explanation) |
| "How do I use it?" | QUICK_START.md (quick reference) |
| "How do I implement it?" | CI_CD_IMPLEMENTATION_ROADMAP.md (step-by-step) |
| "What are the Docker tags?" | CI_CD_WORKFLOWS.md (Docker tagging section) |
| "How do I test before production?" | QUICK_START.md (RC testing phase) |

---

## 🔗 Related Documentation

- **Project Root**: [AGENTS.md](../AGENTS.md) - Project-wide guide
- **Backend**: [apps/smart-pocket-backend/AGENTS.md](../apps/smart-pocket-backend/AGENTS.md)
- **Mobile**: [apps/smart-pocket-mobile/AGENTS.md](../apps/smart-pocket-mobile/AGENTS.md)
- **Docker**: [docker/DOCKER_GUIDE.md](../docker/DOCKER_GUIDE.md)
- **Environment**: [.env.example](../.env.example)

---

## 📝 Document Versions

| Document | Created | Status | Size |
|----------|---------|--------|------|
| CI_CD_WORKFLOWS.md | 2026-03-28 | ✅ Complete | ~16KB |
| WORKFLOW_DECISION_GUIDE.md | 2026-03-28 | ✅ Complete | ~10KB |
| CI_CD_IMPLEMENTATION_ROADMAP.md | 2026-03-28 | ✅ Complete | ~22KB |

---

## 🎓 Learning Resources

### Git & Branching
- [Git Flow Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)

### Semantic Versioning
- [semver.org](https://semver.org/) - Version numbering
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit messages

### GitHub Actions
- [Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Caching Guide](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

---

**Last Updated**: 2026-03-28  
**Status**: Documentation complete  
**Next Step**: Review recommendation and implement
