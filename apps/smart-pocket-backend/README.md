# Smart Pocket Backend

Express.js backend following SOLID principles for the Smart Pocket application.

## Project Structure

```
src/
├── app.js                 # Main application setup
├── config/
│   └── env.js            # Environment configuration
├── controllers/           # Business logic for routes
├── middleware/            # Express middleware
├── routes/                # API route definitions
└── utils/                 # Utility functions
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

## Development

```bash
npm start
```

The API will be available at `http://localhost:3000`

## Health Check

```bash
curl http://localhost:3000/health
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
```

## Features

- **Error Handling**: Centralized error handling middleware
- **Request Validation**: Joi-based request validation
- **Security**: Helmet for HTTP headers, CORS support
- **Logging**: Structured logging utility
- **Health Check**: Service health endpoint

## Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Register the route in `src/app.js`

Example controller:

```javascript
class UserController {
  constructor() {
    this.name = 'UserController';
  }

  getUsers(req, res) {
    res.json({ users: [] });
  }
}

module.exports = UserController;
```
