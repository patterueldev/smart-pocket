# 🤖 AGENTS.md - Development Guide for smart-pocket-functions

> **Purpose**: Guide for agents (AI or human) continuing work on `smart-pocket-functions`. This document maps what's been completed, file locations, architecture decisions, and next steps.

**Last Updated**: 2026-03-26 12:26 UTC  
**Status**: 5 Phases Complete ✅ | Phase 6-8 Pending

---

## 📍 Project Location

```
/Users/pat/Projects/PAT/smart-pocket/apps/smart-pocket-functions/
```

### Directory Structure

```
smart-pocket-functions/
├── sheets-sync/                    ← MAIN WORK HERE
│   ├── config/
│   │   ├── SecretsLoader.js       ← Load secrets from files/env
│   │   ├── ConfigLoader.js        ← Load & validate config
│   │   └── index.js               ← Barrel export
│   ├── lib/
│   │   ├── ActualBudget.js        ← Service lifecycle wrapper
│   │   └── index.js               ← Barrel export
│   ├── queries/
│   │   ├── AccountQueries.js      ← Account query logic
│   │   ├── TransactionQueries.js  ← Transaction query logic
│   │   └── index.js               ← Barrel export
│   ├── mappers/
│   │   ├── BalanceMapper.js       ← Data transformation
│   │   └── index.js               ← Barrel export
│   ├── repository/
│   │   ├── ActualBudgetRepository.js ← Orchestration layer
│   │   └── index.js               ← Barrel export
│   ├── actual-service.js          ← Service bootstrap (26 lines)
│   ├── handler.js                 ← HTTP request handler
│   └── [documentation files]
├── template                        ← OpenFaaS function template
├── stack.yaml                      ← Local development stack config
├── stack.prod.yaml                ← Production stack config
├── transactions/                   ← Legacy directory (not used)
├── build/                          ← Compiled output
└── .gitignore

```

---

## ✅ What's Been Completed

### Phase 1: ActualBudget Service ✅
**What**: Created `ActualBudget` class wrapping `@actual-app/api`  
**Location**: `sheets-sync/lib/ActualBudget.js` (115 lines)  
**Key Methods**:
- `init()` - Initialize budget and sync cache
- `shutdown()` - Cleanup (close connection)
- `withBudget()` - Wrapper ensuring init/shutdown for each operation

**Decisions Made**:
- No file system caching (stateless FaaS design)
- Follows old-app pattern but simplified
- Proper memory cleanup with shutdown

### Phase 2: Data Access Layer (SOLID) ✅
**What**: Created query classes, mappers, and repository layer

**Files Created**:

1. **AccountQueries** (`sheets-sync/queries/AccountQueries.js`)
   - Responsibility: Fetch accounts from budget
   - Key Method: `getAccounts(db)` → returns account objects

2. **TransactionQueries** (`sheets-sync/queries/TransactionQueries.js`)
   - Responsibility: Fetch transactions with filters
   - Key Method: `getTransactions(db, accountId, options)` → returns transactions

3. **BalanceMapper** (`sheets-sync/mappers/BalanceMapper.js`)
   - Responsibility: Calculate and transform balances
   - Key Method: `mapAccountBalance(account, transactions)` → returns formatted balance

4. **ActualBudgetRepository** (`sheets-sync/repository/ActualBudgetRepository.js`)
   - Responsibility: Orchestrate queries and mappers
   - Key Methods:
     - `getAccountBalances()` - Get all account balances (used by GET /)
     - `getTransactions(accountId, options)` - Get filtered transactions
   - Dependency Injection: Accepts `ActualBudget` instance

**Architecture Decision**: 
- Separated concerns: queries (data access) → mappers (transformation) → repository (orchestration)
- All classes independently testable
- Follows all SOLID principles

### Phase 3: Handler Implementation ✅
**What**: Implemented HTTP request handler

**File**: `sheets-sync/handler.js` (122 lines)  
**Endpoint Implemented**: `GET /`
- Returns array of account balances
- Includes cleared/uncleared amounts
- Proper error handling and HTTP status codes
- Session counter for tracking

**Response Format**:
```json
{
  "success": true,
  "data": [{
    "accountId": "acc-001",
    "accountName": "Checking",
    "cleared": { "amount": "5000.00", "currency": "USD" },
    "uncleared": { "amount": "100.50", "currency": "USD" }
  }],
  "meta": {
    "count": 1,
    "timestamp": "2026-03-26T12:26:51.326Z",
    "sessionCount": 1
  }
}
```

### Phase 4: FaaS Optimization ✅
**What**: Removed dataDir for stateless design

**Changes Made**:
- Removed `ACTUAL_BUDGET_DATA_DIR` environment variable
- Removed all file system caching logic from `ActualBudget.js`
- Removed directory creation in service initialization
- Result: Truly stateless FaaS function

**Why This Matters**:
- Each function invocation is independent
- Works with read-only filesystems
- No cleanup between calls needed
- Simpler deployment

**Environment Variables** (4 total):

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `ACTUAL_BUDGET_ID` | Yes | - | Sync ID from Actual Budget |
| `ACTUAL_BUDGET_PASSWORD` | Yes | - | Encryption password |
| `ACTUAL_BUDGET_SERVER_URL` | No | `http://localhost:5006` | Server endpoint |
| `ACTUAL_BUDGET_CURRENCY` | No | `USD` | Display currency |

### Phase 5: Configuration Refactoring (SOLID) ✅
**What**: Extracted configuration logic into dedicated classes

**Files Created**:

1. **SecretsLoader** (`sheets-sync/config/SecretsLoader.js` - 56 lines)
   - **Single Responsibility**: Load secrets from files or environment
   - **Priority Order**:
     1. File: `/var/openfaas/secrets/{key}` (production)
     2. Env var: Convert key to env var name (development)
     3. Error if neither found
   - **Key Method**: `getSecret(secretKey, envVarName)`
   - **Example**: `loader.getSecret('actual-budget-password', 'ACTUAL_BUDGET_PASSWORD')`

2. **ConfigLoader** (`sheets-sync/config/ConfigLoader.js` - 68 lines)
   - **Single Responsibility**: Load and validate all configuration
   - **What It Does**:
     - Uses SecretsLoader to load secrets
     - Validates required config present
     - Provides defaults for optional config
     - Returns clean config object
   - **Key Method**: `loadConfig(customSecretLoader)`
   - **Output**:
     ```javascript
     {
       serverURL: 'http://localhost:5006',
       password: 'secret123',
       budgetId: 'sync123',
       currency: 'USD'
     }
     ```

**Before/After Comparison**:

**Before** (actual-service.js - 47 lines):
- Inline getSecret function
- Hard-coded secret paths
- Mixed configuration + initialization
- Not reusable

**After** (actual-service.js - 26 lines):
```javascript
const { ConfigLoader } = require('./config');
const actualBudget = new ActualBudget(configLoader.loadConfig());
const repository = new ActualBudgetRepository(actualBudget);
```
- Clean and simple
- Reusable config classes
- Full separation of concerns

---

## 🏗️ Architecture Overview

### Layer Model
```
┌────────────────────────────────────┐
│     HTTP Handler (handler.js)       │  ← API entry point
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│    ActualBudgetRepository           │  ← Orchestration
│    (repository/)                    │
└────────────────┬────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
  Queries   Mappers   ActualBudget
  (queries/) (mappers/) (lib/)
```

### Dependency Injection Flow
```
SecretsLoader (loads secrets)
      ↓
ConfigLoader (validates config)
      ↓
ActualBudget (service lifecycle)
      ↓
ActualBudgetRepository (orchestration)
      ↓
handler.js (HTTP layer)
```

### Data Flow Example: GET /
```
Client Request
    ↓
handler.js → handleGet()
    ↓
repository.getAccountBalances()
    ↓
┌─────────────────────────────────────┐
│ ActualBudget.withBudget() wrapper   │
├─────────────────────────────────────┤
│ • Init (load budget)                │
│ • AccountQueries.getAccounts()      │
│ • For each account:                 │
│   - TransactionQueries.getTransactions() │
│   - BalanceMapper.mapAccountBalance()    │
│ • Shutdown                          │
└─────────────────────────────────────┘
    ↓
Response formatted
    ↓
HTTP 200 + JSON
```

---

## 🔄 SOLID Principles Compliance

| Principle | Status | Implementation |
|-----------|--------|-----------------|
| **S** - Single Responsibility | ✅ | Each class has ONE reason to change |
| **O** - Open/Closed | ✅ | Easy to extend (new queries/mappers), no modifications needed |
| **L** - Liskov Substitution | ✅ | All implementations are swappable (testable) |
| **I** - Interface Segregation | ✅ | Clean, focused interfaces on each class |
| **D** - Dependency Inversion | ✅ | Depends on abstractions, not concrete details |

### Example: Adding a New Query
**Without SOLID** (bad):
```javascript
// Would need to modify ActualBudgetRepository
class ActualBudgetRepository {
  getNewData() { /* new implementation */ }
}
```

**With SOLID** (good):
```javascript
// Just create new class, inject it, repository remains unchanged
class NewDataQueries {
  getNewData(db) { /* implementation */ }
}

const repository = new ActualBudgetRepository(actualBudget, new NewDataQueries());
```

---

## 📚 Documentation Files

All documentation is in `sheets-sync/`:

| File | Purpose | Last Updated |
|------|---------|--------------|
| `ENV_VARIABLES.md` | Environment variables and deployment methods | Phase 4 |
| `ARCHITECTURE.md` | Data flow, layer responsibilities, SOLID analysis | Phase 5 |
| `CONFIG_REFACTORING.md` | Config refactoring details and testing approach | Phase 5 |
| `DATADIR_REMOVAL.md` | Rationale for removing dataDir (stateless design) | Phase 4 |
| `REFACTORING_SUMMARY.md` | SOLID violations and solutions | Phase 2 |
| `INDEX.md` | Navigation hub (older, may be outdated) | Phase 2 |

---

## ⏭️ Next Steps (Phase 6-8)

### Phase 6: POST Endpoints (Not Started)
**Location**: `sheets-sync/handler.js`

1. **POST /draft** - Create draft syncable
   - Input: Budget data or delta
   - Output: Draft ID
   - Use: Prepare data for syncing

2. **POST /sync** - Apply draft and update
   - Input: Draft ID
   - Output: Sync result
   - Use: Finalize sync operation

### Phase 7: Unit Tests (Not Started)
**Location**: `sheets-sync/` with `.test.js` or `.spec.js` files

- Test each config class
- Test each query class
- Test mapper logic
- Mock ActualBudget for repository tests

### Phase 8: Integration & Documentation (Not Started)
- Integration tests with real Actual Budget
- API documentation
- Deployment guide
- Troubleshooting guide

---

## 🧪 Testing Strategy

### Current Testing Status
- ✅ Manual testing of GET / endpoint (works)
- ✅ Environment variable loading verified
- ❌ No unit tests yet
- ❌ No integration tests yet

### How to Test GET Endpoint Locally

```bash
cd apps/smart-pocket-functions

# Set environment variables
export ACTUAL_BUDGET_ID="your-sync-id"
export ACTUAL_BUDGET_PASSWORD="your-password"
export ACTUAL_BUDGET_SERVER_URL="http://localhost:5006"
export ACTUAL_BUDGET_CURRENCY="USD"

# Test with mock (in-memory)
node -e "
const handler = require('./sheets-sync/handler');
handler.handle({
  method: 'GET',
  path: '/'
}, {}).then(res => console.log(JSON.stringify(res, null, 2)));
"
```

### How to Mock Components for Testing

```javascript
// Mock SecretsLoader for ConfigLoader testing
class MockSecretsLoader {
  getSecret(key, envVar) {
    return { 'actual-budget-id': 'test-id' }[key];
  }
}

const configLoader = new ConfigLoader(new MockSecretsLoader());
const config = configLoader.loadConfig();
```

---

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run with OpenFaaS (uses stack.yaml)
faas-cli up -f stack.yaml

# Test endpoint
curl http://127.0.0.1:8080/function/sheets-sync
```

### Production Deployment
1. Set secrets: `faas-cli secret create actual-budget-password --from-literal=<password>`
2. Update `stack.prod.yaml` with your settings
3. Deploy: `faas-cli up -f stack.prod.yaml`

---

## 🔍 Key Files Quick Reference

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `actual-service.js` | 26 | Service bootstrap | ✅ |
| `handler.js` | 122 | HTTP handler | ✅ GET only |
| `config/ConfigLoader.js` | 68 | Config loader | ✅ |
| `config/SecretsLoader.js` | 56 | Secrets loader | ✅ |
| `lib/ActualBudget.js` | 115 | Service wrapper | ✅ |
| `queries/AccountQueries.js` | ~40 | Account queries | ✅ |
| `queries/TransactionQueries.js` | ~40 | Transaction queries | ✅ |
| `mappers/BalanceMapper.js` | ~60 | Balance mapping | ✅ |
| `repository/ActualBudgetRepository.js` | 80 | Repository | ✅ |

---

## ⚠️ Known Quirks & Gotchas

### 1. Secret Key Names
- Secret keys already contain prefix: `actual-budget-password`
- Don't double the prefix in env var conversion
- SecretsLoader handles this: `getSecret('actual-budget-password', 'ACTUAL_BUDGET_PASSWORD')`

### 2. dataDir Removal
- Old-app used persistent file caching with `syncIdToBudgetIdMap`
- sheets-sync uses in-memory only (reset per invocation)
- This is by design for stateless FaaS

### 3. Actual Budget API Initialization
- `@actual-app/api` may create temp directories internally
- That's fine - it's controlled by the library, not our code
- We removed our code's use of dataDir, not the library's

### 4. Session Counter
- Handler tracks session count for debugging
- Resets on each function restart
- Use for performance monitoring

---

## 📝 How to Continue This Work

### For Adding a New Endpoint
1. Check `handler.js` for routing pattern
2. Implement new handler method (e.g., `handlePost()`)
3. Add new repository method if needed
4. Create corresponding query/mapper if needed
5. Test with curl or HTTP client
6. Update this document

### For Refactoring Code
1. Check SOLID principles first
2. Review existing patterns in files
3. Create new class/file if adding responsibility
4. Update barrel exports (`index.js`)
5. Test affected modules
6. Document changes

### For Fixing Bugs
1. Reproduce with minimal test case
2. Check which layer failed (config/queries/mappers/handler)
3. Add unit test for the bug
4. Fix the bug
5. Verify test passes

---

## 🔗 Related Files & References

- **Old app reference**: `@old-app/actual-budget.service.js`
- **OpenFaaS docs**: https://docs.openfaas.com/
- **@actual-app/api docs**: Look in node_modules for JSDoc
- **Actual Budget docs**: https://actualbudget.com/

---

## 📞 Questions to Ask When Stuck

1. **Config issue?** → Check SecretsLoader and ConfigLoader
2. **Data access issue?** → Check appropriate Query class
3. **Data format issue?** → Check mapper class
4. **Orchestration issue?** → Check repository
5. **HTTP issue?** → Check handler.js

---

**End of AGENTS.md**

*This document is maintained by development agents working on sheets-sync. Update it when completing new phases.*
