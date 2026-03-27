# Smart Pocket Backend

Express.js backend with TypeScript following SOLID principles for the Smart Pocket application.

## Project Structure

```
src/
├── index.ts               # Entry point
├── app.ts                 # Main application setup
├── config/
│   └── env.ts            # Environment configuration
├── controllers/           # Business logic for routes
├── middleware/            # Express middleware
├── routes/                # API route definitions
└── utils/                 # Utility functions

dist/                      # Compiled JavaScript (generated)
```

## SOLID Principles Applied

- **S**ingle Responsibility: Each class/module has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Proper inheritance and interface contracts
- **I**nterface Segregation: Focused, specific interfaces
- **D**ependency Inversion: Depend on abstractions, not concrete implementations

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

## Development

```bash
npm run dev
```

Runs the server with auto-reload using `nodemon` and `ts-node`.

## Production

```bash
npm run build
npm start
```

## Health Check

```bash
curl http://localhost:3000/health
```

The API will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
```

## Features

- **TypeScript**: Full type safety
- **Error Handling**: Centralized error handling middleware
- **Request Validation**: Joi-based request validation
- **Security**: Helmet for HTTP headers, CORS support
- **Logging**: Structured logging utility
- **Health Check**: Service health endpoint

## Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Register the route in `src/app.ts`

Example controller:

```typescript
import { Request, Response } from 'express';

interface UserResponse {
  success: boolean;
  users: any[];
}

class UserController {
  name: string = 'UserController';

  getUsers(req: Request, res: Response<UserResponse>): void {
    res.json({ success: true, users: [] });
  }
}

export default UserController;
```

See `SOLID_PRINCIPLES.md` for detailed guidance on extending the app with new features.
