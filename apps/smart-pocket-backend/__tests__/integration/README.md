# API Integration Tests

This directory contains comprehensive API integration tests for the Smart Pocket Backend using Supertest and Jest.

## Test Suites

### Auth Endpoints (`auth.api.test.ts`)
Tests for authentication endpoints with 28 test cases covering:
- **POST /auth/setup** - Device authentication and token generation
  - Valid API key handling
  - Invalid/missing/empty API key validation
  - Error cases (401 unauthorized, 400 bad request)
  - Malformed JSON handling
  - Token uniqueness verification

- **POST /auth/refresh** - Access token refresh
  - Valid refresh token handling
  - Invalid/missing/empty refresh token validation
  - JWT validation and expiry handling
  - Token substitution security tests

- **GET /auth/test** - Protected endpoint authentication
  - Valid Authorization header handling
  - Missing/invalid/malformed Authorization headers
  - Bearer token scheme validation
  - Token type validation (access vs refresh)

- **Auth Flow Integration** - Full authentication workflows
  - Complete setup → test → refresh → test cycle
  - Multiple user authentication with same API key
  - Token lifecycle verification

### Health Endpoint (`health.api.test.ts`)
Tests for health check endpoint with 11 test cases covering:
- Successful health check responses
- Proper HTTP status and content-type headers
- Unauthenticated endpoint verification
- JSON response structure validation
- Timestamp validity
- Security (no sensitive data exposure)
- HTTP method handling
- Concurrent request handling

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

## Running in Docker

```bash
# Build test image
docker build -f docker/Backend.test.dockerfile -t smart-pocket-backend-test:latest apps/smart-pocket-backend

# Run tests in container
docker run --rm smart-pocket-backend-test:latest
```

## Test Statistics

- **Total Integration Tests**: 39
- **Total Unit Tests**: 132
- **Combined Pass Rate**: 100% (171/171)
- **Execution Time**: ~6-8 seconds total
- **Coverage**: All critical endpoints and error paths

## Key Testing Patterns

### Server Setup
Tests use Supertest with a fresh Express app instance for each test suite to ensure isolation and prevent test pollution.

### Environment Setup
Test environment variables are set before importing the app to ensure proper configuration loading:
```typescript
process.env.API_KEYS = 'test-api-key-12345,another-test-key-67890';
const appInstance = new App();
const app = appInstance.getApp();
```

### Token Timing
JWT tokens include an `iat` (issued at) claim using seconds precision. Tests that verify token uniqueness include delays to ensure different timestamps:
```typescript
await new Promise((resolve) => setTimeout(resolve, 1100));
```

### Error Response Format
API errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

## Test Organization

```
__tests__/integration/
├── auth.api.test.ts          # 28 tests for auth endpoints
├── health.api.test.ts        # 11 tests for health endpoint
├── fixtures/
│   └── requests.ts           # Test payloads and fixtures
└── helpers/
    └── testServer.ts         # Test utilities and helpers
```

## CI/CD Integration

Tests are integrated into GitHub Actions workflows:
- Run on every pull request
- Run on every push to main
- Part of the backend build checks
- Docker-based test runner available

## Future Enhancements

- [ ] Add database integration tests when database is implemented
- [ ] Add authentication middleware comprehensive tests
- [ ] Add rate limiting tests
- [ ] Add request validation tests for edge cases
- [ ] Performance benchmarking tests
- [ ] Load testing with multiple concurrent users

## Debugging

To debug tests:

```bash
# Run a specific test file
npm test -- __tests__/integration/auth.api.test.ts

# Run a specific test
npm test -- --testNamePattern="should return 200"

# Show detailed output
npm test -- --verbose

# Keep tests open
npm test -- --watch
```

## Notes

- Tests use real Express app, not mocked
- External dependencies (JWT, crypto) are real implementations
- Tests verify full request/response cycle
- No database tests (backend not yet integrated with DB)
- Authentication tests use static API keys configured via environment
