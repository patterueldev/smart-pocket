# Smart Pocket Mobile - Quick Reference Guide (AI & Developers)

**Quick links to documentation:**
- 📚 **Comprehensive details** → [README.md](./README.md)
- 🚀 **Getting started** → [README.md § Getting Started](./README.md#getting-started)
- 🏗️ **Architecture** → [README.md § Services Architecture & SOLID](./README.md#services-architecture--solid)
- 🔐 **Authentication** → [README.md § Authentication System](./README.md#authentication-system)
- ❌ **Troubleshooting** → [README.md § Troubleshooting](./README.md#troubleshooting)

---

## 🤖 FOR AI AGENTS: Essential Quick Reference

This guide is **intentionally small** to fit in your token budget. For detailed information, **refer to README.md** sections linked above.

### Project Overview
- **Framework**: Expo + React Native + TypeScript
- **Routing**: File-based (Expo Router in `src/app/`)
- **State**: Redux + AuthContext
- **Architecture**: SOLID principles + Dependency Injection

### Key Conventions

| Convention | Example | File Pattern |
|---|---|---|
| **Interfaces** | `IAuthService` | `I{Name}.ts` |
| **Implementations** | `AuthService`, `MockAuthService` | `{Name}.ts`, `Mock{Name}.ts` |
| **Services** | Created via `ServiceFactory` | `src/services/{category}/` |
| **Hooks** | `useSetupForm`, `useAuthInitialization` | `src/hooks/use{Name}.ts` |
| **Components** | `ThemedLayout`, `RootNavigator` | `src/components/{Name}.tsx` |
| **Screens** | `HomeScreen`, `SetupScreen` | `src/app/{name}.tsx` |

### Critical Files

```
src/services/ServiceFactory.ts      ← Dependency wiring (modify here to add services)
src/utils/authContext.tsx           ← App initialization (auth, service setup)
src/store/slices/auth.ts            ← Redux auth state
src/app/_layout.tsx                 ← Root layout (auth + routing)
src/app/setup.tsx                   ← Login/setup screen
```

### Current Setup Status

```
✅ Services: All have interface + real + mock implementation
✅ DIP: All services created via ServiceFactory (not hardcoded)
✅ Auth: Mock services active (USE_MOCK_SERVICES = true in authContext.tsx)
✅ Tests: 27 passing, zero regressions
✅ SOLID: All components follow SOLID principles
```

### Switch Mock ↔ Real Services

```typescript
// In src/utils/authContext.tsx, change one flag:

// For testing/development:
const USE_MOCK_SERVICES = true;  // Uses MockAuthService, MockApiClient, etc.

// For production:
const USE_MOCK_SERVICES = false; // Uses AuthService, ApiClient, etc.
// (No other code changes needed - that's DIP in action!)
```

### Common Commands

```bash
# Start development
npm start

# Run tests
npm test

# Type check
npm run type-check

# Find service implementations
find src/services -name "*.ts" -type f

# Find a specific hook
ls src/hooks/use*.ts

# Grep for conventions
grep -r "interface I" src/services/
```

---

## 🎯 Making Changes: Quick Tasks

### Add New API Endpoint

1. **Update interface** → `src/services/api/IApiClient.ts`
2. **Implement in real client** → `src/services/api/ApiClient.ts`
3. **Implement in mock client** → `src/services/api/MockApiClient.ts`
4. **Use in component** → `const { apiClient } = ServiceFactory.createServices('real')`

**For details** → [README.md § Task: Add a New API Endpoint](./README.md#task-add-a-new-api-endpoint)

### Add New Screen

1. **Create file** → `src/app/(protected)/my-screen.tsx`
2. **Implement component** (Expo Router finds it automatically)
3. **Use auth context** → `const auth = useContext(AuthContext)`

**For details** → [README.md § Task: Add a New Screen](./README.md#task-add-a-new-screen)

### Add New Custom Hook

1. **Create file** → `src/hooks/use{Name}.ts`
2. **Implement hook** (use services via `ServiceFactory`)
3. **Use in components** → `const data = use{Name}()`

**For details** → [README.md § Task: Add a New Custom Hook](./README.md#task-add-a-new-custom-hook)

### Create New Service

1. **Create interface** → `src/services/{category}/I{Name}.ts`
2. **Create implementation** → `src/services/{category}/{Name}.ts`
3. **Create mock** → `src/services/{category}/Mock{Name}.ts`
4. **Wire in ServiceFactory** → `src/services/ServiceFactory.ts`

**For details** → [README.md § Task: Create a New Service](./README.md#task-create-a-new-service)

---

## 🔐 Authentication Quick Reference

```
User Setup Flow:
  1. User enters API key + URL
  2. POST /auth/setup → Backend validates
  3. Returns accessToken + refreshToken
  4. StorageService saves securely on device
  5. AuthContext updated → isLoggedIn = true
  6. Navigate to dashboard

Token Refresh (Automatic):
  1. API request made with accessToken
  2. Backend returns 401 (token expired)
  3. ApiClient interceptor catches 401
  4. Automatically calls POST /auth/refresh
  5. Retries original request with new token
  6. Success (or logout if refresh fails)
```

**For deep dive** → [README.md § Authentication System](./README.md#authentication-system)

---

## 📁 Project Structure (Quick Lookup)

```
src/
├── app/                    ← Expo Router (routes = file names)
├── services/               ← Business logic (SOLID DIP pattern)
├── store/                  ← Redux state management
├── hooks/                  ← Custom React hooks
├── components/             ← Reusable UI components
├── utils/                  ← Utilities (authContext, etc)
└── __tests__/              ← Unit tests
```

**For full structure** → [README.md § Project Structure Details](./README.md#project-structure-details)

---

## ⚠️ Common Issues & Fixes

| Problem | Quick Fix | Full Guide |
|---------|-----------|-----------|
| App won't start | `rm -rf node_modules && npm install && npm start` | [README § App Won't Start](./README.md#app-wont-start) |
| Hot reload broken | Restart dev server: `npm start` | [README § Hot Reload Not Working](./README.md#hot-reload-not-working) |
| Token refresh fails | Logout and login again | [README § Token refresh failed](./README.md#token-refresh-failed-error) |
| Service not injecting | Check `ServiceFactory.ts` wiring | [README § Create New Service](./README.md#task-create-a-new-service) |
| TypeScript errors | Run `npm run type-check` | [README § Cannot find module](./README.md#cannot-find-module-typescript-error) |

**For full troubleshooting** → [README.md § Troubleshooting](./README.md#troubleshooting)

---

## 📚 Documentation Map

| Need | Location | Time |
|------|----------|------|
| Getting started setup | README.md § Getting Started | 5 min |
| Understand architecture | README.md § Services Architecture | 10 min |
| See auth flow diagram | README.md § Authentication System | 5 min |
| Write new API endpoint | README.md § Task: Add API Endpoint | 10 min |
| Debug 401 token error | README.md § Token refresh failed | 5 min |
| Full file tree | README.md § Project Structure Details | 5 min |
| SOLID refactoring case study | README.md § SOLID Refactoring | 15 min |
| Testing guide | README.md § Testing Guide | 10 min |

---

## 🔗 Direct File References

```
Key files to understand the codebase:

DIP/Services:
  src/services/ServiceFactory.ts       ← All services wired here
  src/services/auth/IAuthService.ts    ← Auth interface contract
  src/services/api/IApiClient.ts       ← API interface contract

Auth/State:
  src/utils/authContext.tsx            ← App initialization
  src/store/slices/auth.ts             ← Redux auth reducer
  src/hooks/useAuthInitialization.ts   ← Auth init hook

Layout/Routing:
  src/app/_layout.tsx                  ← Root layout
  src/components/RootNavigator.tsx     ← Route management
  src/components/ThemedLayout.tsx      ← Theme provider

Example:
  src/app/setup.tsx                    ← Setup screen implementation
  src/hooks/useSetupForm.ts            ← Form logic hook
  src/components/SetupFormUI.tsx       ← Form UI component
```

---

## ✅ What to Do

1. **First time?** → Read [README.md § Getting Started](./README.md#getting-started)
2. **Making a change?** → Find your task in "Making Changes: Quick Tasks" above
3. **Understanding architecture?** → Jump to [README.md § Services Architecture](./README.md#services-architecture--solid)
4. **Hit an error?** → Search [README.md § Troubleshooting](./README.md#troubleshooting)

---

**Last Updated**: 2026-03-29  
**Status**: Active development  
**Backend**: Mock services (set `USE_MOCK_SERVICES = false` to use real backend)

For comprehensive documentation, see **[README.md](./README.md)**
