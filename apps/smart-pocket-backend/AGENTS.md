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

```typescript
// ✅ Implement interface for DIP (Dependency Inversion)
export interface IYourController {
  methodName(req: Request, res: Response<ResponseType>): void;
}

// ✅ All methods typed, error handling via middleware
export class YourController implements IYourController {
  methodName(req: Request, res: Response<ResponseType>): void {
    res.json({ success: true, data: {...} });
  }
}
```

## Input Validation

Use Joi schemas. See [README.md - Validation](./README.md#input-validation) for patterns.

## Important Files

| File | Purpose |
|------|---------|
| `src/app.ts` | App setup, middleware, route registration |
| `src/config/env.ts` | Environment configuration |
| `src/interfaces/` | Service & controller contracts (DIP) |
| `src/controllers/` | HTTP request handlers |
| `src/services/` | Business logic, shared across controllers |
| `src/models/` | Request/Response DTOs |
| `src/middleware/` | Cross-cutting concerns (auth, validation) |
| `src/routes/` | Endpoint routing |

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

- **S**ingle Responsibility: Controllers handle HTTP, Services handle logic
- **O**pen/Closed: Extend via new files, don't modify existing
- **L**iskov Substitution: Services/Controllers implement interfaces
- **I**nterface Segregation: Focused interfaces (`IJwtService`, `IAuthController`)
- **D**ependency Inversion: Depend on interfaces, not concrete classes

Example:
```typescript
// Routes depend on interface (DIP)
const controller: IAuthController = new AuthController();

// Easy to swap implementations for testing
const mockController: IAuthController = new MockAuthController();
```

## Error Handling

Centralized error middleware catches all errors. Return appropriate responses:

```typescript
// Explicit response
if (!found) {
  res.status(404).json({ success: false, message: 'Not found' });
  return;
}

// Let middleware handle unexpected errors
throw new Error('Something failed');
```

## Authentication Endpoints (Implemented)

- **POST /auth/setup** - Exchange API key for JWT tokens
- **POST /auth/refresh** - Issue new access token via refresh token
- **GET /auth/test** - Protected endpoint (requires Bearer token)

See [TESTING_NOTES.md](./TESTING_NOTES.md) for curl examples.

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
