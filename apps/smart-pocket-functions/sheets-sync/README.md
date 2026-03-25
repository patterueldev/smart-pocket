# Sheets Sync FaaS Function

TypeScript-based OpenFaaS function that syncs account balances from Actual Budget to Google Sheets, following SOLID principles with clean architecture patterns.

## Architecture

```
├── src/
│   ├── handler.ts              # OpenFaaS entry point with DI setup
│   ├── router.ts               # HTTP routing logic
│   ├── controllers/            # Request handlers
│   │   ├── sync-draft.controller.ts    # GET /draft handler
│   │   └── sync-approval.controller.ts # POST /sync handler
│   ├── services/               # Business logic
│   │   ├── google-sheets.service.ts    # Google Sheets operations (IGoogleSheetsService)
│   │   ├── sync.service.ts             # Sync orchestration
│   │   └── draft.service.ts            # Draft management
│   ├── stores/                 # Data persistence
│   │   └── draft-store.ts      # In-memory draft storage
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts            # Core types & interfaces
│   └── utils/                  # Utilities
│       └── logger.ts           # Logging wrapper
└── dist/                       # Compiled JavaScript output
```

## SOLID Principles Implementation

### Single Responsibility
- **Controllers**: Handle HTTP request/response
- **Services**: Orchestrate business logic
- **Stores**: Manage data persistence
- **Router**: Direct requests to controllers

### Open/Closed
- Router easily extensible with new routes
- Services can be extended without modification
- Interface-based design for testability

### Liskov Substitution
- All services implement defined interfaces
- Interface contracts ensure substitutability
- `IGoogleSheetsService` defines sync operations contract

### Interface Segregation
- Focused interfaces: `IGoogleSheetsService`, `IDraftStore`, `IDraftService`
- Clients depend only on needed methods
- No bloated interfaces with unused methods

### Dependency Inversion
- All dependencies injected via constructors
- Services depend on abstractions (interfaces), not concrete implementations
- Handler orchestrates DI graph

## API Endpoints

### GET /draft
Returns pending sync changes (draft) comparing Actual Budget balances with last synced values.

**Request:**
```bash
curl -X GET http://localhost:8080/draft
```

**Response (200 OK):**
```json
{
  "message": "Sync draft retrieved successfully",
  "draft": {
    "id": "uuid",
    "createdAt": "2026-03-24T12:42:05.694Z",
    "pendingChanges": [
      {
        "type": "UPDATE",
        "accountName": "Checking",
        "cleared": {
          "current": { "amount": "1000.00", "currency": "USD" },
          "synced": { "amount": "950.00", "currency": "USD" }
        }
      }
    ],
    "summary": {
      "totalAccounts": 5,
      "newAccounts": 0,
      "updatedAccounts": 1,
      "unchangedAccounts": 4
    }
  }
}
```

**Response (200 OK - No changes):**
```json
{
  "message": "No pending sync changes",
  "draft": null
}
```

### POST /sync
Approves and executes a sync draft to Google Sheets.

**Request:**
```bash
curl -X POST http://localhost:8080/sync \
  -H "Content-Type: application/json" \
  -d '{"draftId": "uuid"}'
```

**Response (200 OK):**
```json
{
  "message": "Sync completed successfully",
  "result": {
    "success": true,
    "draftId": "uuid",
    "syncedAt": "2026-03-24T12:42:05.694Z",
    "accountsSynced": 5,
    "rowsWritten": 5
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid request",
  "message": "draftId is required and must be a string",
  "code": "INVALID_REQUEST"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Draft not found",
  "message": "Draft not found or expired",
  "code": "DRAFT_NOT_FOUND"
}
```

## Environment Variables

```bash
# Actual Budget Configuration
ACTUAL_BUDGET_URL=http://localhost:5006
ACTUAL_BUDGET_PASSWORD=your-password

# Google Sheets Configuration
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SHEET_NAME=Accounts (optional, defaults to "Accounts")
GOOGLE_CREDENTIALS_JSON_PATH=/data/keys/smart-pocket-server.json (optional)
DEFAULT_CURRENCY=USD

# Logging
DEBUG=false (set to "true" for debug logging)
```

## Building

```bash
npm install
npm run build
```

Outputs compiled JavaScript to `dist/handler.js`.

## Development

```bash
npm run dev
```

Uses `ts-node` to run TypeScript directly for development.

## Integration with Existing Service

This function wraps the existing `google-sheets.service.js` module located at the project root. The service handles:
- Fetching current balances from Actual Budget
- Reading last synced values from Google Sheets
- Comparing and detecting changes
- Updating Google Sheets with new balances

The TypeScript wrapper provides:
- Type safety through interfaces
- Dependency injection for testability
- Clean separation of concerns
- HTTP routing and error handling
- Request/response transformation

### Runtime Dependencies

The `google-sheets.service.js` module requires access to:
- `utils/logger` - Logging utilities
- `actual-budget.service` - Actual Budget API integration
- `googleapis` - Google Sheets API client

These dependencies are resolved from the project root when deployed via OpenFaaS. Ensure your OpenFaaS stack includes these utilities in the deployment context.
