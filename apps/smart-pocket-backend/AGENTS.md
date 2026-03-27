# AGENTS.md - Development Guide

This guide is for developers and AI agents building features in the Smart Pocket Backend. It covers architecture decisions, patterns, and workflows for extending the application.

## Architecture Overview

The backend uses a **layered, class-based architecture** with clear separation of concerns:

```
Request → Routes → Controllers → Services (future) → Database (future)
             ↓
         Middleware (logging, validation, errors)
```

**Why this structure?**
- Easy to test each layer independently
- Controllers focus on HTTP concerns (request/response)
- Services handle business logic (when added)
- Middleware handles cross-cutting concerns
- Follows SOLID principles for maintainability

## Technology Stack

- **Runtime**: Node.js 24+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js 5.x
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Development**: ts-node, nodemon
- **Package Manager**: npm

## Before You Start

1. **Environment Setup**
   ```bash
   npm install
   npm run dev  # Start with hot-reload
   ```

2. **Verify Setup**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "Service is healthy",
     "timestamp": "2026-03-27T08:55:29.883Z"
   }
   ```

3. **Key Files to Know**
   - `src/app.ts` - App configuration, middleware setup, route registration
   - `src/index.ts` - Entry point
   - `src/config/env.ts` - Environment variables
   - `tsconfig.json` - TypeScript configuration
   - `package.json` - Dependencies and scripts

## Development Workflow

### Adding an Endpoint

**Step 1: Create Controller**
```typescript
// src/controllers/userController.ts
import { Request, Response } from 'express';

interface UsersResponse {
  success: boolean;
  users: Array<{ id: string; name: string }>;
}

class UserController {
  name: string = 'UserController';

  getUsers(req: Request, res: Response<UsersResponse>): void {
    // TODO: Fetch from database
    res.json({ success: true, users: [] });
  }

  getUser(req: Request, res: Response): void {
    const { id } = req.params;
    // TODO: Validate, fetch, return
    res.json({ success: true, user: null });
  }
}

export default UserController;
```

**Step 2: Create Routes**
```typescript
// src/routes/users.ts
import { Router, Request, Response } from 'express';
import UserController from '../controllers/userController';

const router = Router();
const controller = new UserController();

// GET /users
router.get('/', (req: Request, res: Response) => {
  controller.getUsers(req, res);
});

// GET /users/:id
router.get('/:id', (req: Request, res: Response) => {
  controller.getUser(req, res);
});

export default router;
```

**Step 3: Register Routes**
Edit `src/app.ts` in `setupRoutes()`:
```typescript
// Add import at top
import userRoutes from './routes/users';

// In setupRoutes() method, before the 404 handler:
this.app.use('/users', userRoutes);
```

**Step 4: Test**
```bash
npm run dev
curl http://localhost:3000/users
```

### Adding Middleware

**Step 1: Create Middleware**
```typescript
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // TODO: Verify token
  req.userId = 'user123';
  next();
};

export default authMiddleware;
```

**Step 2: Register Middleware**

For global middleware (all routes), edit `src/app.ts` in `setupMiddleware()`:
```typescript
// After existing middleware
this.app.use(authMiddleware);
```

For specific routes, add to route file:
```typescript
// src/routes/users.ts
import authMiddleware from '../middleware/authMiddleware';

router.get('/', authMiddleware, (req, res) => {
  controller.getUsers(req, res);
});
```

### Input Validation

Use Joi for request validation:

```typescript
// src/routes/users.ts
import Joi from 'joi';
import validateRequest from '../middleware/validateRequest';

const createUserSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  age: Joi.number().optional().min(0).max(150),
});

router.post('/', validateRequest(createUserSchema), (req, res) => {
  const validatedData = (req as any).validatedBody;
  // validatedData is guaranteed to match schema
  controller.createUser(req, res);
});
```

Response on validation error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "\"name\" is required"
    }
  ]
}
```

### Error Handling

The centralized error handler catches all errors. Return appropriate responses:

```typescript
// ✅ GOOD: Explicit error response
if (!user) {
  res.status(404).json({
    success: false,
    message: 'User not found',
  });
  return;
}

// ✅ GOOD: Throw error for unexpected issues
if (dbError) {
  const error: any = new Error('Database connection failed');
  error.status = 500;
  throw error;
}
```

## Code Patterns

### Type All Responses

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Usage
res.json<ApiResponse<User>>({
  success: true,
  data: { id: '1', name: 'John' },
});
```

### Consistent Error Responses

```typescript
// Always include success flag
res.status(400).json({
  success: false,
  message: 'Invalid request',
});

// With details
res.status(422).json({
  success: false,
  message: 'Validation failed',
  errors: [{ field: 'email', message: 'Invalid email' }],
});
```

### Controller Method Pattern

```typescript
// Pattern: All controller methods take (req, res) and return void
class SomeController {
  methodName(req: Request, res: Response<ResponseType>): void {
    try {
      // 1. Extract and validate input
      const { id } = req.params;
      
      // 2. Call service or perform action
      const result = this.doSomething(id);
      
      // 3. Return response
      res.json({ success: true, data: result });
    } catch (error) {
      // Errors are caught by error handler middleware
      throw error;
    }
  }
}
```

## Extending Features

### Adding a Service Layer

Once you have multiple endpoints with shared logic, create a service:

```typescript
// src/services/userService.ts
class UserService {
  async getUser(id: string) {
    // Fetch from database
    return { id, name: 'John' };
  }

  async createUser(data: CreateUserInput) {
    // Validate, save to database
    return { id: '1', name: data.name };
  }
}

export default new UserService();
```

Use in controller:
```typescript
import userService from '../services/userService';

class UserController {
  async getUser(req: Request, res: Response): Promise<void> {
    const user = await userService.getUser(req.params.id);
    res.json({ success: true, data: user });
  }
}
```

### Adding Database

When adding a database (Prisma, TypeORM):

1. **Install package**
   ```bash
   npm install prisma
   ```

2. **Initialize**
   ```bash
   npx prisma init
   ```

3. **Create service that uses DB**
   ```typescript
   // src/services/userService.ts
   import { PrismaClient } from '@prisma/client';
   
   const prisma = new PrismaClient();
   
   class UserService {
     async getUser(id: string) {
       return prisma.user.findUnique({ where: { id } });
     }
   }
   ```

## Common Tasks

### Build for Production
```bash
npm run build      # Compile TypeScript
npm start          # Run compiled app
```

### Debug an Issue
```bash
# 1. Check if code compiles
npm run build

# 2. Check if server starts
npm run dev

# 3. Test endpoint
curl -X GET http://localhost:3000/health -v

# 4. Check logs in console output
```

### Add a New Dependency
```bash
# Install
npm install <package>

# Add to TypeScript types if needed
npm install --save-dev @types/<package>

# If build fails, check tsconfig.json
npm run build
```

### Rename/Refactor Code
TypeScript helps catch issues. After refactoring:
```bash
npm run build  # Shows all type errors
npm run dev    # Test in development
```

### Performance Check
```bash
# Request logs show duration
[INFO] GET /users { status: 200, duration: '45ms' }

# Slow requests may indicate:
# - Database query issue
# - Missing index
# - N+1 query problem
```

## SOLID Principles in Practice

**When writing new code, follow these:**

1. **Single Responsibility** - Each class does one thing
   - ✅ UserController handles HTTP for users
   - ❌ UserController also handles email sending

2. **Open/Closed** - Extend without modifying existing code
   - ✅ Add new routes without changing app.ts
   - ❌ Modifying app.ts to add each endpoint

3. **Liskov Substitution** - Swap implementations easily
   - ✅ All controllers follow same pattern
   - ❌ Some controllers async, some sync

4. **Interface Segregation** - Focused interfaces
   - ✅ Logger has 5 methods (log, error, warn, info, debug)
   - ❌ Logger has 50 methods

5. **Dependency Inversion** - Depend on abstractions
   - ✅ Middleware receives logger as parameter
   - ❌ Middleware creates new Logger() instance

## TypeScript Usage

### Type Everything

```typescript
// ✅ GOOD: Explicit types
function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

// ❌ BAD: Implicit any
function calculateAge(birthYear: any): any {
  return new Date().getFullYear() - birthYear;
}
```

### Define Response Interfaces

```typescript
// ✅ GOOD: All responses have defined shape
interface GetUsersResponse {
  success: boolean;
  users: Array<{ id: string; name: string }>;
}

res.json<GetUsersResponse>({
  success: true,
  users: [],
});

// ❌ BAD: Response shape unknown
res.json({ foo: 'bar', baz: 123 });
```

### Avoid `any` Type

```typescript
// ✅ GOOD
interface User {
  id: string;
  name: string;
}

const user: User = { id: '1', name: 'John' };

// ❌ BAD
const user: any = { id: '1', name: 'John' };
```

## Debugging Tips

### Check Compilation
```bash
npm run build
# Shows all TypeScript errors before runtime
```

### Enable Debug Logging
Edit `.env`:
```
DEBUG=*
```

Logs will show which middleware runs:
```
[INFO] GET /users { status: 200, duration: '5ms' }
```

### Test Single Endpoint
```bash
# GET request
curl http://localhost:3000/users

# POST with body
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'

# With headers
curl http://localhost:3000/users \
  -H "Authorization: Bearer token123"
```

### Port Already in Use?
```bash
# Find process
lsof -ti:3000

# Kill it (replace PID)
kill <PID>
```

## Commit Guidelines

```bash
# Good commit messages
"feat: Add user authentication endpoint"
"fix: Handle empty request body in validator"
"refactor: Extract userService from controller"
"docs: Update AGENTS.md with new patterns"

# Bad commit messages
"update"
"fix bug"
"changes"
```

Include in commit message when relevant:
- What changed
- Why it changed
- How to test it

## Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **Joi Validation**: https://joi.dev/api/
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **RESTful API Design**: https://restfulapi.net/

## Checklist for New Features

- [ ] Create controller with typed methods
- [ ] Create route file with all endpoints
- [ ] Register route in `src/app.ts`
- [ ] Add input validation with Joi
- [ ] Define response interfaces
- [ ] Handle errors appropriately
- [ ] Add request logging (automatic)
- [ ] Test with curl or Postman
- [ ] Compile: `npm run build`
- [ ] Run: `npm run dev`
- [ ] Commit with clear message

## Q&A for Developers

**Q: Where do I add database logic?**
A: Create a service in `src/services/`. Controllers call services, services interact with database.

**Q: How do I handle async operations?**
A: Controller methods can be async. Always catch errors and return appropriate responses.

**Q: Should I modify middleware?**
A: Only if adding cross-cutting concerns (auth, logging, validation). For business logic, use services.

**Q: What if I need to refactor old code?**
A: TypeScript will show all issues. Run `npm run build` after changes.

**Q: How do I test my changes?**
A: Use `curl`, Postman, or write integration tests. Check response status and body.

**Q: Can I change the folder structure?**
A: Yes, but update imports in `src/app.ts`. Keep layers separate: routes → controllers → services.
