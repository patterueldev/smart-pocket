# Smart Pocket Web - AGENTS.md

Quick reference guide for AI agents and developers working on the React web application.

**Status**: ✅ SOLID compliant (5/5)  
**Updated**: 2026-04-21

## 📍 Quick Start

**Setup**:
```bash
cd apps/smart-pocket-web
npm install
npm run dev
```

**Verify Installation**:
```bash
npm run lint         # Check for linting errors
npm run build        # Compile TypeScript and bundle
npm test             # Run tests
```

**Available Commands**:
- `npm run dev` - Start dev server (hot reload at http://localhost:5173 locally, or via nginx at smartpocket-dev.nicenature.space/ui remotely)
- `npm run build` - Production build
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm test` - Run Jest tests
- `npm test:watch` - Watch mode for tests
- `npm test:coverage` - Generate coverage report
- `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
apps/smart-pocket-web/
├── src/
│   ├── __tests__/              ← Unit tests
│   ├── components/             ← React components (UI + routing)
│   │   ├── AuthProvider.tsx    ← Auth state provider (context)
│   │   ├── SetupFormUI.tsx     ← Pure UI component (form)
│   │   ├── ProtectedRoute.tsx  ← Route guard (auth check)
│   │   ├── RootRoute.tsx       ← Smart root routing
│   │   └── ...
│   ├── pages/                  ← Page components (coordinators)
│   │   ├── Setup.tsx           ← Setup page (setup flow coordinator)
│   │   ├── Dashboard.tsx       ← Dashboard page (feature display)
│   │   └── ...
│   ├── hooks/                  ← Custom React hooks
│   │   ├── useAuth.ts          ← Auth context consumer
│   │   ├── useSetupForm.ts     ← Setup form logic (presentation-agnostic)
│   │   └── ...
│   ├── services/               ← Business logic layer (DI container + service implementations)
│   │   ├── ServiceFactory.ts   ← Dependency injection container
│   │   ├── auth/               ← Authentication service
│   │   │   ├── IAuthService.ts ← Interface (contract)
│   │   │   ├── AuthService.ts  ← Real implementation (HTTP)
│   │   │   ├── MockAuthService.ts ← Mock implementation (testing)
│   │   │   └── ...
│   │   └── storage/            ← Storage service
│   │       ├── IStorageService.ts ← Interface (contract)
│   │       ├── LocalStorageService.ts ← Implementation (browser)
│   │       └── ...
│   ├── types/                  ← TypeScript type definitions
│   │   └── auth.ts             ← Auth-related types
│   ├── utils/                  ← Utility functions
│   │   ├── config.ts           ← Configuration helpers
│   │   ├── createAuthContext.ts ← Context creation
│   │   ├── AuthContextType.ts  ← Context type definition
│   │   └── ...
│   ├── config/                 ← App configuration
│   │   └── routing.ts          ← Router configuration
│   ├── App.tsx                 ← Root component (wrappers)
│   ├── main.tsx                ← Application entry point
│   ├── index.css               ← Global styles
│   ├── router.tsx              ← Route definitions
│   └── vite-env.d.ts           ← Vite type definitions
├── public/                     ← Static assets
├── dist/                       ← Production build output
├── .eslintrc.json              ← Linting configuration
├── .prettierrc                  ← Code formatting configuration
├── jest.config.cjs             ← Jest testing configuration
├── vite.config.ts              ← Vite bundler configuration
├── tsconfig.json               ← TypeScript configuration (strict mode)
├── package.json                ← Dependencies and scripts
├── AGENTS.md                   ← This file (quick reference)
└── README.md                   ← Comprehensive documentation
```

## 🔧 Tech Stack

- **Framework**: React 19 with TypeScript (strict mode)
- **Bundler**: Vite 8 (fast development builds, HMR with WebSocket)
- **Linting**: ESLint + Prettier (consistent code style)
- **Testing**: Jest + React Testing Library
- **Language**: TypeScript (strict mode enabled)
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6

## 🏛️ Architecture & SOLID Principles

**Smart Pocket Web is 5/5 SOLID compliant:**

### S - Single Responsibility Principle ✅
- **Components**: Each component has one job (UI rendering)
  - `SetupFormUI.tsx` - Form UI only
  - `Dashboard.tsx` - Dashboard display only
- **Services**: Each service handles one domain
  - `AuthService` - Authentication logic only
  - `LocalStorageService` - Persistence only
- **Hooks**: Each hook handles one concern
  - `useAuth()` - Context consumption
  - `useSetupForm()` - Form validation and submission logic
- **Pages**: Page components are coordinators that wire together hooks and services
  - `Setup.tsx` - Coordinates useSetupForm + AuthProvider + routing

### O - Open/Closed Principle ✅
- Service interfaces are contracts (IAuthService, IStorageService)
- Can add new implementations without modifying existing code
- MockAuthService and AuthService both implement IAuthService interface
- Feature flags via query params: `?useMockAuth=true` switches implementations

### L - Liskov Substitution Principle ✅
- All AuthService implementations are interchangeable
- MockAuthService and AuthService have identical contracts
- Can swap one for the other without breaking dependent code
- AuthProvider consumes IAuthService interface, not concrete class

### I - Interface Segregation Principle ✅
- IAuthService has focused methods (setup, logout, refreshAccessToken, loadStoredAuth)
- IStorageService has focused methods (saveTokens, getTokens, saveCredentials, getCredentials, etc.)
- No unused methods forced on implementers

### D - Dependency Inversion Principle ✅
- ServiceFactory is the DI container
- AuthProvider depends on IAuthService interface, not AuthService class
- Services depend on abstractions (IStorageService) not concrete implementations
- Inversion of control: components request services from factory, not creating them directly

**Key Pattern**: ServiceFactory + Interface-based architecture
```typescript
// ❌ Don't do this (breaks DIP)
const authService = new AuthService(storageService);

// ✅ Do this (DIP compliant)
const authService = ServiceFactory.getAuthService(); // Returns IAuthService
```

## 🎯 Common Tasks

### Setup Flow (Authentication)

**Flow**: SetupFormUI → useSetupForm hook → AuthProvider.setup() → LocalStorageService

1. User enters API key and URL in SetupFormUI
2. SetupFormUI calls `handleSubmit()` from useSetupForm hook
3. useSetupForm calls `authContext.setup(apiKey, baseUrl)`
4. AuthProvider.setup() calls `authService.setup(credentials)` (via ServiceFactory)
5. AuthService makes HTTP POST to backend `/auth/setup`
6. Backend returns access token + refresh token
7. AuthService saves tokens via StorageService (localStorage)
8. AuthProvider updates context state (isSetup = true)
9. Setup page redirects to /dashboard
10. On page refresh, AuthProvider.useEffect loads stored credentials from localStorage

**Key Files**:
- `pages/Setup.tsx` - Coordinator (routing, form, auth)
- `hooks/useSetupForm.ts` - Form logic (validation, submission)
- `components/SetupFormUI.tsx` - UI only
- `components/AuthProvider.tsx` - State management + service orchestration
- `services/auth/AuthService.ts` - HTTP + token management
- `services/storage/LocalStorageService.ts` - Persistence

### Add a New Page

1. Create `src/pages/MyPage.tsx`:
```typescript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MyPage() {
  const navigate = useNavigate();
  const authContext = useAuth();
  
  return <div>My Page</div>;
}
```

2. Add route to `src/router.tsx`:
```typescript
<Route path="/mypage" element={<MyPage />} />
```

3. Link to it from another page:
```typescript
navigate('/mypage');
```

### Add a New Component

**Presentation Component** (pure UI, no hooks):
```typescript
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClicke}>{title}</button>;
}
```

**Container Component** (with hooks, logic):
```typescript
import { useAuth } from '../hooks/useAuth';

export function MyContainer() {
  const authContext = useAuth();
  
  return <MyComponent title="Hello" onClic={() => {}} />;
}
```

### Connect to Backend API

1. Add method to `IAuthService`:
```typescript
export interface IAuthService {
  // ... existing methods
  getSheets(): Promise<Sheet[]>;
}
```

2. Implement in `AuthService.ts`:
```typescript
async getSheets(): Promise<Sheet[]> {
  const response = await axios.get<Sheet[]>(
    `${this.baseUrl}/sheets`
  );
  return response.data;
}
```

3. Use in component:
```typescript
const authService = ServiceFactory.getAuthService();
const sheets = await authService.getSheets();
```

### Write a Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

Run: `npm test`

## ✅ Code Quality Standards

**TypeScript**:
- Strict mode enabled (`"strict": true` in tsconfig.json)
- All functions must have return types
- All variables must be typed
- No `any` types without justification in comments

**Linting**:
```bash
npm run lint           # Must show 0 errors
npm run format:check   # Must show 0 formatting issues
npm run build          # Must compile without errors
```

**Testing**:
- Critical paths have tests (authentication, setup flow)
- Tests use React Testing Library (user-centric)
- Run: `npm test`
- Coverage threshold: 50% global

**Git Commits**:
```bash
git commit -m "feat: Add new feature

Detailed description of changes and why.

Fixes #123"
```

## 🚨 Troubleshooting

**Dev server won't start**:
- Ensure Node.js version 18+
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try a different port: `npm run dev -- --port 5174`

**Auth not persisting on refresh**:
- Check browser localStorage for `sp_credentials` and `sp_tokens` keys
- Verify AuthProvider.useEffect is loading from storage
- Check console for `[AuthProvider] Loaded from storage` logs

**WebSocket 502 error** (Vite HMR):
- This is expected in remote dev (nginx WebSocket setup is complex)
- Manual hard refresh (Ctrl+Shift+R) will work around it
- See infrastructure/nginx-dev/conf.d/server.conf for details

**Tests failing**:
- Run `npm test` to see error details
- Check test file has correct imports
- Verify component renders properly in isolation
- Clear Jest cache: `npm test -- --clearCache`

**TypeScript errors**:
- Check tsconfig.json strict mode is enabled
- Ensure all function parameters have types
- Verify return types on all functions
- Run `npm run build` to validate

## 📚 Key Concepts

**AuthProvider Pattern**:
- Uses React Context to expose auth state globally
- Loads credentials from localStorage on mount
- Manages state: `isSetup`, `apiKey`, `apiBaseUrl`, `isInitializing`
- Provides methods: `setup()`, `logout()`

**Routing Pattern**:
- RootRoute: Smart redirect based on `isSetup` state
- ProtectedRoute: Guards routes, requires `isSetup=true`
- Setup page: Auto-redirects to dashboard if already authenticated
- Uses React Router v6 with React Router DOM

**Service Factory Pattern**:
- DI container that creates and manages service singletons
- Reduces coupling between components and services
- Enables easy mocking for testing
- See `services/ServiceFactory.ts`

**Hook Pattern**:
- useAuth: Consumes AuthContext
- useSetupForm: Isolated form logic (reusable, testable)
- Hooks are business logic, components are UI

## 🔗 Related Guides

- Backend API: `@apps/smart-pocket-backend/AGENTS.md`
- Mobile App: `@apps/smart-pocket-mobile/AGENTS.md`
- Docker Setup: `@infrastructure/docker/DOCKER_GUIDE.md`
- Project Overview: `@AGENTS.md`
- Nginx Config: `@infrastructure/nginx-dev/nginx.conf`
