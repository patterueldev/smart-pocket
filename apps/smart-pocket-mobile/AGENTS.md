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

## 🔄 Google Sheets Sync Feature

The Google Sheets Sync feature synchronizes Actual Budget account balances with Google Sheets. This section covers the mobile implementation.

### Feature Overview

**Purpose**: Allow users to sync account balances from Actual Budget to a Google Sheets spreadsheet for tracking and reporting.

**Flow**:
1. User navigates to Sheets Sync screen
2. App calls `/sheets-sync/draft` endpoint
3. Backend compares Actual Budget accounts with Google Sheets data
4. Mobile displays pending changes for user review
5. User taps "Sync Now" button
6. App calls `/sheets-sync/sync` endpoint
7. Backend updates Google Sheets with new balances

**States**:
- 📊 **Loading**: Fetching draft from backend
- ✅ **Empty**: All accounts synced (display success message)
- ⚠️ **Pending**: Changes available (display list + sync button)
- 🔄 **Syncing**: Executing sync operation
- ❌ **Error**: Something went wrong (display error + retry)

### Architecture

#### Hook: `useSheetsSync`
**File**: `src/hooks/useSheetsSync.ts`

Manages all sheets sync state and operations:
```typescript
const { draft, loading, syncing, refreshing, error, onRefresh, onSync } = useSheetsSync();

// draft: SheetsSyncDraft | null      ← Current draft with changes
// loading: boolean                   ← Initial load state
// syncing: boolean                   ← Sync operation in progress
// refreshing: boolean                ← Pull-to-refresh in progress
// error: string | null               ← Error message if any
// onRefresh: () => Promise<void>    ← Refresh draft (debounced 500ms)
// onSync: () => Promise<void>       ← Execute sync with current draft
```

**Key Features**:
- Debounced refresh to prevent spam (500ms minimum interval)
- Automatic error recovery
- Clear state transitions
- Fully tested (10 unit tests)

#### Components

**`src/components/sheets-sync/SyncEmptyState.tsx`**
- Displays when all synced
- Shows last sync timestamp
- Green checkmark icon
- Dark mode support

**`src/components/sheets-sync/SyncSummary.tsx`**
- Displays change statistics
- Shows: Total, New, Updated accounts
- Color-coded badges
- Dark mode support

**`src/components/sheets-sync/SyncChangeItem.tsx`**
- Displays individual account change
- Shows: Account name, current balance, sheet balance
- Red → Green arrow visualization
- Currency-aware formatting
- Supports 12 currencies (PHP default)

**`src/components/sheets-sync/SyncErrorState.tsx`**
- Displays error message
- Includes retry button
- Professional error UX
- Dark mode support

**`src/components/sheets-sync/SyncActionButton.tsx`**
- Sync button with loading state
- Disabled during errors
- Loading spinner animation
- Dark mode support

#### Screen: `src/app/(protected)/sync.tsx`

Main sync screen:
1. Uses `useSheetsSync` hook for state
2. Renders appropriate component based on state
3. Handles pull-to-refresh
4. Manages dark mode
5. Proper safe area insets

### Service Integration

#### Interface: `ISheetsSync`
**File**: `src/services/sheets-sync/ISheetsSync.ts`

Contract for sheets sync operations:
```typescript
interface ISheetsSync {
  createDraft(): Promise<SheetsSyncDraft>;
  executeSyncFromDraft(draftId: string): Promise<SheetsSyncResult>;
  hasPendingChanges(): Promise<boolean>;
  getLastSyncTime(): Promise<string | null>;
}
```

#### Implementation: `MockSheetsSyncClient`
**File**: `src/services/sheets-sync/MockSheetsSyncClient.ts`

Test implementation with 4 sample accounts:
- Cash (₱15,500)
- BDO Checking (₱125,000.50)
- Savings (₱450,000)
- Business Account (₱85,000, new)

Use for development/testing without backend dependency.

#### Implementation: `RealSheetsSyncClient` ⭐
**File**: `src/services/sheets-sync/RealSheetsSyncClient.ts`

Production implementation that calls backend API endpoints:

**Methods**:
- `createDraft()` - Calls POST /sheets-sync/draft, returns draft with real account data
- `executeSyncFromDraft(draftId)` - Calls POST /sheets-sync/sync, syncs changes to Google Sheets
- `hasPendingChanges()` - Checks if changes pending
- `getLastSyncTime()` - Returns last sync timestamp

**Features**:
- ✅ HTTP integration with backend
- ✅ Comprehensive error handling (HTTP 400/401/404/500, network errors)
- ✅ Response validation (ensures required fields)
- ✅ Smart caching (draftId, lastSyncTime) to reduce API calls
- ✅ Cache management (`clearCache()` for testing)
- ✅ Console logging for debugging
- ✅ Full JSDoc documentation

**Error Handling**:
```typescript
// HTTP 400 - Bad Request
"Bad request: Invalid parameters"

// HTTP 401 - Unauthorized  
"Unauthorized: Please check your API key"

// HTTP 404 - Not Found
"Not found: Draft not found"

// HTTP 500 - Server Error
"Server error: Database connection failed"

// Network Timeout
"Request timeout: Backend took too long to respond"

// Connection Error
"Network error: Could not reach backend server"
```

**Usage** (automatically selected based on configuration):
```typescript
// In ServiceFactory, when sheets_sync_mode = 'real':
const sheetsSync = new RealSheetsSyncClient(apiClient);
```

**Testing**:
```bash
npm test -- RealSheetsSyncClient.test.ts  # 20 unit tests
```

All 20 tests cover draft creation, sync execution, error scenarios, and caching.

### Testing

**Test File**: `src/__tests__/hooks/useSheetsSync.test.ts`

10 test cases covering:
```
✓ Initialization with loading state
✓ Load draft on mount
✓ Handle error on mount
✓ Refresh draft
✓ Debounce rapid refresh calls
✓ Execute sync with current draft
✓ Reload draft after sync
✓ Handle sync error
✓ Return error when no draft available
✓ Clear error on successful refresh
```

Run tests:
```bash
npm test -- useSheetsSync.test.ts
```

### SOLID Principles

**Single Responsibility** ✅
- Hook: State management only
- Components: Display only
- Service: API abstraction only

**Open/Closed** ✅
- Interface enables multiple implementations
- Can add new components without changing existing ones
- New sync sources can be added

**Liskov Substitution** ✅
- Mock client works identically to real client
- Can swap implementations transparently

**Interface Segregation** ✅
- Components receive only needed props
- Hook returns only needed values
- ISheetsSync interface focused

**Dependency Inversion** ✅
- Components depend on hook, not service
- Hook depends on interface, not implementation
- ServiceFactory provides dependency injection

### How to Use

#### 1. From Screens
```typescript
import { useSheetsSync } from '@/hooks/useSheetsSync';

export default function SyncScreen() {
  const { draft, loading, error, onRefresh, onSync } = useSheetsSync();
  // Use hook state to render UI
}
```

#### 2. From Components
```typescript
import { SyncChangeItem } from '@/components/sheets-sync';

<SyncChangeItem change={accountChange} />
```

#### 3. Add to ServiceFactory
Already added:
```typescript
const sheetsSync = mode === 'mock'
  ? new MockSheetsSyncClient()
  : new MockSheetsSyncClient(); // TODO: Replace with real client
```

### Configuration

**Toggle Mock Services**:
```typescript
// In src/utils/authContext.tsx
const USE_MOCK_SERVICES = true; // Change to false for real backend
```

**Debounce Interval**:
```typescript
// In src/hooks/useSheetsSync.ts
const REFRESH_DEBOUNCE_MS = 500; // Adjust if needed
```

### Common Tasks

#### Change Currency
Edit mock data in `MockSheetsSyncClient.ts`:
```typescript
currency: 'USD' // Change to any supported currency
```

#### Add More Sample Accounts
Edit `SAMPLE_CHANGES` in `MockSheetsSyncClient.ts`:
```typescript
{
  accountId: 'acct-5',
  accountName: 'My New Account',
  currentBalance: 10000,
  sheetBalance: 9500,
  currency: 'PHP',
  isNew: false,
  lastSyncTime: new Date().toISOString(),
}
```

#### Replace Mock with Real
1. Create `RealSheetsSyncClient` implementing `ISheetsSync`
2. Update `ServiceFactory.ts`:
   ```typescript
   const sheetsSync = new RealSheetsSyncClient(apiClient);
   ```
3. No component changes needed (that's DIP!)

#### Add New UI State
1. Add state type to `useSheetsSync` return
2. Add component for new state (follows `SyncEmptyState` pattern)
3. Add conditional rendering in `sync.tsx`
4. Add test case to `useSheetsSync.test.ts`

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Can't find module" | Run `npm install` |
| Tests failing | Ensure `jest.useFakeTimers()` in beforeEach |
| Mock data not appearing | Check `MockSheetsSyncClient.ts` SAMPLE_CHANGES |
| Sync not working | Verify backend endpoint is available |
| Dark mode broken | Check `useColorScheme` import in components |

### Next Steps (Phase 6+)

1. **Real Backend Integration**
   - Create `RealSheetsSyncClient`
   - Connect to `/sheets-sync/draft` and `/sheets-sync/sync` endpoints
   - Handle authentication headers

2. **Enhanced Features**
   - Sync history screen
   - Selective account sync
   - Scheduled sync
   - Conflict resolution UI

3. **Performance**
   - Offline sync queue
   - Caching strategy
   - Background sync (Expo TaskManager)

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

## ⚙️ Configuration: Mock vs Real Backend

The Google Sheets Sync feature can run in two modes:

### Mock Mode (Default - Safe for Development)

Uses `MockSheetsSyncClient` with synthetic data. No backend required.

**When to use**:
- Local development
- UI/UX testing
- Testing without backend

**Enable**: 
```typescript
// In src/hooks/useSheetsSync.ts
const USE_MOCK_SERVICES = true;  // Default
```

**Sample Data**:
- Cash: ₱15,500
- BDO: ₱125,000.50
- Savings: ₱450,000
- Business: ₱85,000 (new account)

### Real Mode (Production - Backend Integration)

Uses `RealSheetsSyncClient` with actual backend API.

**When to use**:
- Integration testing
- Staging environment
- Production deployment

**Prerequisites**:
1. Backend running: `docker-compose up`
2. User authenticated with valid credentials
3. Backend base URL configured

**Enable**:
```typescript
// In src/hooks/useSheetsSync.ts
const USE_MOCK_SERVICES = false;
```

**Or via environment variable** (when fully implemented):
```bash
USE_REAL_SHEETS_SYNC=true npm start
```

**Configuration Files**:
- `src/config/index.ts` - Feature flags and base URL
- `app.config.js` - Environment-specific API endpoints
- `src/constants/config.ts` - Runtime config loading

**Base URL Priority**:
1. User-provided URL (from setup screen)
2. Environment variable `REACT_APP_API_URL`
3. App environment config (app.config.js)
4. Default: `http://localhost:3000`

### Mode Switching Reference

| Mode | File | Variable | Default | Status |
|------|------|----------|---------|--------|
| Mock | `useSheetsSync.ts` | `USE_MOCK_SERVICES` | `true` | ✅ Ready |
| Real | `useSheetsSync.ts` | `USE_MOCK_SERVICES` | `false` | ✅ Ready |
| Env | `src/config/index.ts` | `USE_REAL_SHEETS_SYNC` | (future) | 🔄 Planned |

### Troubleshooting Configuration

**Problem**: Seeing mock data when real backend enabled

**Solution**:
1. Verify `USE_MOCK_SERVICES = false` in `useSheetsSync.ts`
2. Check backend is running: `docker-compose ps`
3. Verify user is authenticated
4. Check console for errors

**Problem**: "Network error: Could not reach backend"

**Solution**:
1. Ensure backend is running: `docker-compose up`
2. Check backend is listening: `docker logs smart-pocket-backend`
3. Verify correct base URL in setup
4. Check firewall/proxy settings

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
| Learn Sheets Sync feature | AGENTS.md § Google Sheets Sync | 10 min |
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

**Last Updated**: 2026-03-30 (Phase 5: Added Google Sheets Sync documentation)  
**Status**: Active development  
**Features**: Auth + Google Sheets Sync  
**Backend**: Mock services (set `USE_MOCK_SERVICES = false` to use real backend)

For comprehensive documentation, see **[README.md](./README.md)**
