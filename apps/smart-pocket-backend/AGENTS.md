# AGENTS.md - Smart Pocket Backend

**Quick guide for developers and AI agents.** For comprehensive details, see [README.md](./README.md).

## 30-Second Orientation

- **Tech**: Node.js 24, TypeScript (strict mode), Express.js 5, Joi validation
- **Architecture**: Layered (Routes → Controllers → Services) + Middleware
- **Pattern**: All controllers implement typed interfaces, all responses typed
- **Key Principle**: Implement SOLID principles—especially DIP, LSP, ISP

## Getting Started

```bash
npm install
npm run dev          # Hot-reload on src/ changes
curl http://localhost:3000/health
```

## Adding a New Endpoint

1. **Create controller** (`src/controllers/`)
2. **Create route** (`src/routes/`)
3. **Register in** `src/app.ts` setupRoutes()
4. **Test**: `curl http://localhost:3000/your-endpoint`

See [README.md - Adding Routes](./README.md#adding-routes) for detailed examples.

## Controller Pattern

All controllers:
- Implement a typed interface (`IYourController`) for dependency inversion
- Receive dependencies via constructor (not direct imports)
- Handle HTTP requests and delegate to services
- Return typed responses (no untyped data)

See [README.md - Adding Routes](./README.md#adding-routes) for complete code examples.

## Input Validation

Validation is extracted to dedicated middleware for clean separation of concerns:
- Create middleware in `src/middleware/validate*.ts` 
- Use Joi schemas to validate `req.body`
- Attach validated data to `req.validatedBody`
- Controllers receive pre-validated data

See [README.md - Validation Middleware Pattern](./README.md#validation-middleware-pattern) for complete working examples.

## Important Files

| File | Purpose |
|------|---------|
| `src/container.ts` | **Service Container/IoC** - Manages dependency injection and service registration |
| `src/app.ts` | App setup, middleware, route registration |
| `src/config/env.ts` | Environment configuration |
| `src/interfaces/` | Service & controller contracts (DIP) |
| `src/controllers/` | HTTP request handlers (constructor-injected dependencies) |
| `src/services/` | Business logic, shared across controllers |
| `src/models/` | Request/Response DTOs |
| `src/middleware/` | Cross-cutting concerns (auth, validation, logging) |
| `src/routes/` | Endpoint routing with middleware |
| `src/errors/` | **ApplicationError class** and error codes (structured error handling) |
| `src/repositories/` | **Repository interfaces** for future database integration (preparation layer) |

## Key Commands

```bash
npm run dev          # Development (hot-reload)
npm run build        # TypeScript compilation
npm run lint         # Check for errors
npm run lint:fix     # Auto-fix formatting
npm start            # Run compiled app (production)
```

## SOLID Compliance

Every layer implements SOLID principles:

- **S**ingle Responsibility: Controllers handle HTTP, Services handle logic, Middleware handles validation/cross-cutting concerns
- **O**pen/Closed: Extend via new files, don't modify existing
- **L**iskov Substitution: Services/Controllers implement interfaces
- **I**nterface Segregation: Focused interfaces (`IJwtService`, `IAuthController`)
- **D**ependency Inversion: All services injectable via constructor; managed by Service Container

The codebase uses a **Service Container** (`src/container.ts`) to manage dependencies, enabling easy testing with mock services.

See [README.md - Dependency Injection & Service Container](./README.md#dependency-injection--service-container) for implementation examples and unit testing patterns.

## Error Handling

The codebase uses a centralized error handler middleware that catches all errors:
- Return explicit responses for known errors (e.g., `res.status(404).json(...)`)
- Throw errors for unexpected conditions; middleware handles the response
- Custom `ApplicationError` class available for structured error handling

See [README.md - Error Handling](./README.md#error-handling) for error patterns and response formats.

## Implemented Features

The backend currently provides:
- **POST /auth/setup** - Exchange API key for JWT tokens
- **POST /auth/refresh** - Issue new access token via refresh token
- **GET /auth/test** - Protected endpoint (requires Bearer token)
- **GET /health** - Health check endpoint
- **POST /sheets-sync/draft** - Create sync draft with pending changes
- **POST /sheets-sync/sync** - Execute sync from draft ID

### Google Sheets Sync Endpoints

**POST /sheets-sync/draft**

Creates a draft of pending changes by comparing Actual Budget accounts with Google Sheets data.

Request:
```bash
curl -X POST http://localhost:3000/sheets-sync/draft \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

Response (200 OK):
```json
{
  "draftId": "draft-abc123xyz-1234567890",
  "totalAccounts": 9,
  "newAccounts": 1,
  "updatedAccounts": 8,
  "unchangedAccounts": 0,
  "changes": [
    {
      "accountId": "acc-1",
      "accountName": "Cash",
      "currentBalance": 15500,
      "sheetBalance": 15000,
      "currency": "PHP",
      "isNew": false,
      "lastSyncTime": "2026-03-30T00:31:00.000Z"
    }
  ],
  "createdAt": "2026-03-30T00:31:43.591Z",
  "lastSyncTime": "2026-03-30T00:31:00.000Z"
}
```

**POST /sheets-sync/sync**

Executes the sync operation by updating Google Sheets with data from the draft.

Request:
```bash
curl -X POST http://localhost:3000/sheets-sync/sync \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "draftId": "draft-abc123xyz-1234567890"
  }'
```

Response (200 OK):
```json
{
  "success": true,
  "syncedAt": "2026-03-30T00:31:43.591Z",
  "accountsUpdated": 8,
  "accountsAdded": 1,
  "message": "Successfully synced 9 accounts to Google Sheets"
}
```

Error Response (404 Not Found):
```json
{
  "error": "Draft not found",
  "draftId": "draft-abc123xyz-1234567890"
}
```

### Implementation Details

**Files**:
- `src/controllers/sheetsSyncController.ts` - HTTP request handling
- `src/routes/sheets-sync.ts` - Route definitions
- `src/services/SheetsSyncService.ts` - Business logic
- `src/services/ActualBudgetService.ts` - Actual Budget API integration
- `src/services/GoogleSheetsService.ts` - Google Sheets API integration
- `src/middleware/validateSyncRequest.ts` - Request validation
- `src/__tests__/sheets-sync.test.ts` - 20+ test cases

**Architecture**:
```
Request
  ↓
Middleware (auth, validation)
  ↓
sheetsSyncController (HTTP layer)
  ↓
SheetsSyncService (business logic)
  ├→ ActualBudgetService (fetch accounts)
  └→ GoogleSheetsService (compare & update sheets)
  ↓
Response (formatted)
```

**Key Services**:

1. **SheetsSyncService**
   - Creates drafts by comparing data sources
   - Executes syncs from approved drafts
   - Handles draft lifecycle (creation, storage, deletion)

2. **ActualBudgetService**
   - Authenticates with Actual Budget
   - Retrieves budget and accounts
   - Calculates balance sums
   - Caches data for performance

3. **GoogleSheetsService**
   - Authenticates with Google API
   - Reads current sheet data
   - Writes updated balances
   - Handles formatting (currency, dates)

**SOLID Principles**:
- **SRP**: Each service has single responsibility
- **OCP**: New sync sources can be added (interface-based)
- **LSP**: All services implement contracts correctly
- **ISP**: Services depend only on needed methods
- **DIP**: Services injected via container, not hardcoded

### Testing

**Test Coverage**: 56 tests
```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- sheets-sync     # Sheets sync tests only
```

**Test Scenarios Covered**:
- Draft creation with account comparison
- Sync execution with Google Sheets updates
- Error handling (missing accounts, API failures)
- Currency formatting (12 currencies supported)
- Empty sync (no changes)
- Concurrent requests
- Token refresh during operation

See [README.md - Testing Sheets Sync](./README.md#testing-sheets-sync) for detailed test examples.

See [README.md - Authentication Endpoints](./README.md#authentication-endpoints) for curl examples and testing instructions.

## TypeScript Rules

- ✅ Type all function parameters and returns
- ✅ Define response interfaces before using
- ✅ Avoid `any` type (use `unknown` if necessary)
- ✅ Use strict mode (enabled in tsconfig.json)

## Common Tasks

**Q: Add a new API endpoint?** → Create controller, route, register in app.ts  
**Q: Add middleware?** → Create in `src/middleware/`, apply in `src/app.ts` or route file  
**Q: Add a service?** → Create `src/services/<Name>Service.ts`, implement interface  
**Q: Debug compilation?** → `npm run build` shows all TypeScript errors  
**Q: Build fails?** → Check imports and types; `npm run build` shows exact errors  

For complete examples and detailed patterns, see [README.md](./README.md).

## When to Use README.md

Refer to README.md for:
- Code examples and templates
- Architecture deep-dive
- Testing strategies  
- Environment configuration
- Troubleshooting
- Adding services/middleware in detail
