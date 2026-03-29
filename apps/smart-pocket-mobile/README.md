# Smart Pocket Mobile - Comprehensive Developer Guide

Complete documentation for developing the Smart Pocket Mobile app (Expo + React Native + TypeScript).

**Quick Navigation:**
- 👤 **First time?** → [Getting Started](#getting-started)
- 🎨 **Building features?** → [Common Development Tasks](#common-development-tasks)
- 🔐 **Understanding auth?** → [Authentication System](#authentication-system)
- 🏗️ **Architecture questions?** → [Services Architecture & SOLID](#services-architecture--solid)
- 🧪 **Testing?** → [Testing Guide](#testing-guide)
- ❌ **Something broken?** → [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ (`node --version`)
- npm or yarn
- Git
- Expo CLI: `npm install -g expo-cli`

### Initial Setup

```bash
# 1. Navigate to mobile app folder
cd apps/smart-pocket-mobile

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

# 4. Choose your platform
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Press 'w' for web browser
# - Scan QR code with Expo Go app on physical device
```

### Verify Setup

```bash
# Check Node version
node --version  # Should be 18+

# Check npm packages installed
npm list expo-router

# Run tests (should pass)
npm test

# Start dev server
npm start
```

### Hot Reload

Both **TypeScript changes** and **component changes** hot reload automatically:
1. Edit a file in `src/`
2. Save the file
3. Changes appear on device/emulator immediately

---

## Project Structure Details

### Directory Organization

```
src/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout (auth + theming)
│   ├── setup.tsx                # Setup/login screen
│   └── (protected)/             # Auth-gated routes
│       ├── _layout.tsx          # Protected layout
│       ├── (tabs)/              # Tab navigation
│       │   ├── _layout.tsx
│       │   ├── index.tsx        # Home screen
│       │   └── explore.tsx      # Explore screen
│       └── modal.tsx            # Modal example
│
├── services/                     # Business logic (SOLID DIP)
│   ├── ServiceFactory.ts        # ✨ DIP wiring hub
│   ├── auth/
│   │   ├── IAuthService.ts      # Interface
│   │   ├── AuthService.ts       # Real implementation
│   │   └── MockAuthService.ts   # Mock implementation
│   ├── storage/
│   │   ├── IStorageService.ts
│   │   ├── StorageService.ts
│   │   └── MockStorageService.ts
│   └── api/
│       ├── IApiClient.ts
│       ├── ApiClient.ts
│       └── MockApiClient.ts
│
├── store/                        # Redux state management
│   ├── store.ts                 # Redux configuration
│   └── slices/
│       └── auth.ts              # Auth reducer + thunks
│
├── hooks/                        # Custom React hooks
│   ├── useAuthInitialization.ts # Auth init lifecycle
│   ├── useSplashController.ts   # Splash screen control
│   ├── useSetupForm.ts          # Form logic (validation)
│   ├── use-app-redux.ts         # Typed Redux hooks
│   └── use-color-scheme.ts      # Theme detection
│
├── components/                   # Reusable UI components
│   ├── ThemedLayout.tsx         # Theme provider wrapper
│   ├── RootNavigator.tsx        # Root navigation routing
│   ├── SetupFormUI.tsx          # Pure form UI
│   ├── themed-text.tsx          # Themed text component
│   ├── themed-view.tsx          # Themed container
│   └── ...
│
├── utils/
│   ├── authContext.tsx          # App auth state + service initialization
│   └── ...
│
├── constants/
│   ├── colors.ts                # Color constants
│   ├── config.ts                # Configuration (API URLs, etc)
│   └── ...
│
├── types/
│   └── auth.ts                  # TypeScript types for auth
│
└── __tests__/
    ├── hooks/
    │   └── useSetupForm.test.ts
    └── services/
        └── auth/
            └── AuthService.test.ts
```

### Key Directories Explained

| Directory | Purpose | Files |
|-----------|---------|-------|
| `src/app/` | **Expo Router** - file-based navigation | `_layout.tsx`, screens |
| `src/services/` | **Business Logic** - SOLID DIP pattern | Interface + 2 implementations |
| `src/store/` | **Redux** - state management | Slices, thunks, selectors |
| `src/hooks/` | **Custom Hooks** - reusable logic | Auth, form, UI hooks |
| `src/components/` | **UI Components** - reusable UI | Buttons, inputs, layouts |
| `src/utils/` | **Utilities** - auth context setup | Service initialization |

---

## Services Architecture & SOLID

### The SOLID Principles Applied

#### 1. Single Responsibility Principle (SRP)
Each service/component has **one reason to change**:
- `AuthService` - only handles auth logic
- `StorageService` - only handles secure storage
- `ApiClient` - only handles HTTP requests
- `ThemedLayout` - only handles theming
- `RootNavigator` - only handles routing

#### 2. Open/Closed Principle (OCP)
Code is **open for extension, closed for modification**:
- Need mock auth for testing? Use `MockAuthService` (no code changes)
- Need real auth for production? Use `AuthService` (no code changes)
- Components don't know which implementation they're using

#### 3. Liskov Substitution Principle (LSP)
All implementations are **interchangeable**:
```typescript
// These are equivalent - LSP in action
const authService = ServiceFactory.createServices('mock').authService;
const authService = ServiceFactory.createServices('real').authService;
// Same interface, same behavior contract
```

#### 4. Interface Segregation Principle (ISP)
No client depends on **interfaces they don't use**:
- `RootNavigator` doesn't know about auth details
- `SetupFormUI` doesn't know about storage
- Each component depends only on what it uses

#### 5. Dependency Inversion Principle (DIP)
**Depend on abstractions, not concrete implementations**:
```typescript
// ❌ WRONG: Hard-coded dependency
const authService = new AuthService(); // Tightly coupled

// ✅ RIGHT: Inject abstraction
const { authService } = ServiceFactory.createServices('real');
// Loosely coupled, easily testable
```

### Service Architecture Pattern

Every service follows this structure:

```
Service Category/
├── IServiceName.ts      (Interface - defines contract)
├── ServiceName.ts       (Real implementation - production)
└── MockServiceName.ts   (Mock implementation - testing/dev)
```

**Example - Auth Service:**
```
auth/
├── IAuthService.ts      # "What must auth do?"
├── AuthService.ts       # "How does real auth work?"
└── MockAuthService.ts   # "How does test auth work?"
```

### ServiceFactory: The DIP Hub

Location: `src/services/ServiceFactory.ts`

**Purpose**: Centralized dependency wiring - all services created here.

**Usage**:
```typescript
// In any component or hook
const { authService, storageService, apiClient } = 
  ServiceFactory.createServices('real'|'mock');
```

**Why it matters**: Change one place (ServiceFactory), affects entire app.

### Current Setup

✅ **All services have 3 implementations**: Interface + Real + Mock  
✅ **ServiceFactory wires everything**: DIP hub in one place  
✅ **Using mocks in development**: `USE_MOCK_SERVICES = true` in `authContext.tsx`  
✅ **Ready for real backend**: Change flag to `false`, no other code changes  

---

## Authentication System

### High-Level Flow

```
Splash Screen (showing)
       ↓
Auth Initialization
       ├─ Load stored tokens from device
       └─ Try to refresh if expired
       ↓
   [Logged In?]
   /          \
  YES          NO
   ↓            ↓
Dashboard    Setup Screen
(Protected)  (Enter API key)
               ↓
          Setup with Backend
               ↓
        Store tokens securely
               ↓
        Navigate to Dashboard
```

### Context: AuthContext

Location: `src/utils/authContext.tsx`

**Provides**:
```typescript
interface AuthContextType {
  // State
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  isLoading: boolean;
  
  // Methods
  setup(credentials): Promise<void>; // Setup with API key
  logout(): Promise<void>;           // Clear everything
  initializeFromStorage(): Promise<void>; // Load from device
}
```

**Usage in components**:
```typescript
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';

export default function MyComponent() {
  const auth = useContext(AuthContext);
  
  console.log(auth.isLoggedIn);     // true/false
  console.log(auth.accessToken);    // token or null
  
  await auth.setup({ apiKey: '...', baseUrl: '...' });
}
```

### Hooks: useAuthInitialization

Location: `src/hooks/useAuthInitialization.ts`

**Purpose**: Manage auth state on app startup

**What it does**:
1. Loads stored tokens from secure storage
2. Checks if tokens are expired
3. Refreshes if needed
4. Returns ready state (boolean)

**Usage**:
```typescript
const isReady = useAuthInitialization(authContext);

if (!isReady) {
  return null; // Show splash while loading
}

return <AppContent />; // Show app when ready
```

### Service: AuthService

Location: `src/services/auth/`

**Implements**: `IAuthService`

**Methods**:
```typescript
interface IAuthService {
  // Setup with API key and server URL
  setup(credentials: AuthCredentials): Promise<AuthTokens>;
  
  // Refresh access token using refresh token
  refreshAccessToken(refreshToken: string): Promise<string>;
  
  // Clear all stored auth data
  logout(): Promise<void>;
  
  // Load saved tokens from storage
  loadStoredAuth(): Promise<AuthTokens | null>;
}
```

**Real Implementation** (`AuthService.ts`):
- Makes HTTP requests to `/auth/setup`
- Uses `ApiClient` for backend communication
- Uses `StorageService` for token persistence

**Mock Implementation** (`MockAuthService.ts`):
- Returns fake tokens immediately
- Simulates setup delay
- No actual API calls

### Token Management

**Access Token** (short-lived, ~1 hour):
- Sent in every API request
- Format: `Authorization: Bearer {token}`
- Checked on every request

**Refresh Token** (long-lived, ~7 days):
- Stored securely on device
- Used to get new access tokens
- Never sent in requests

**Refresh Flow** (Automatic):
```typescript
// Interceptor in ApiClient catches 401 responses
401 Response
  ↓
Automatically refresh token
  ↓
Retry original request with new token
  ↓
Success (or fail if refresh fails)
```

### Setup Process

1. **User enters API key + server URL**
   ```typescript
   await auth.setup({
     apiKey: 'user-provided-key',
     baseUrl: 'https://api.example.com'
   })
   ```

2. **Backend validates and returns tokens**
   ```
   POST /auth/setup
   Body: { apiKey: "...", baseUrl: "..." }
   Response: { accessToken: "...", refreshToken: "..." }
   ```

3. **Tokens stored securely on device**
   ```typescript
   StorageService.setTokens({
     accessToken: '...',
     refreshToken: '...'
   })
   ```

4. **Redux auth state updated**
   ```typescript
   authSlice.fulfilled → state.isLoggedIn = true
   ```

5. **Navigate to dashboard**
   ```typescript
   <Redirect href="/dashboard" />
   ```

---

## Making API Calls

### Using ApiClient

Location: `src/services/api/ApiClient.ts`

**Setup** (automatic via ServiceFactory):
```typescript
const { apiClient } = ServiceFactory.createServices('real');
```

**Making requests**:
```typescript
// GET request
const data = await apiClient.get('/endpoint', {
  headers: { /* optional */ }
});

// POST request
const data = await apiClient.post('/endpoint', { body: 'data' }, {
  headers: { /* optional */ }
});

// Automatic features:
// ✅ Authorization header added
// ✅ 401 errors trigger token refresh
// ✅ Error formatting (user-friendly messages)
// ✅ Timeout handling
```

### Example: Fetch User Profile

```typescript
export async function fetchUserProfile(apiClient: IApiClient) {
  try {
    const profile = await apiClient.get('/api/user/profile');
    return profile;
  } catch (error: any) {
    const message = error.message || 'Failed to fetch profile';
    throw new Error(message);
  }
}
```

### Error Handling

**ApiClient catches and formats errors**:
```typescript
// Backend returns 400 validation error
{
  statusCode: 400,
  message: 'Invalid input',
  errors: { email: ['Invalid email'] }
}

// ApiClient throws ApplicationError
throw new ApplicationError('Invalid input', 400);

// Component catches
catch (error) {
  console.log(error.message);  // 'Invalid input'
  console.log(error.statusCode); // 400
}
```

**Token errors** (401):
```typescript
// Automatically refreshed by interceptor
// If refresh fails, user logged out
// Component receives 401 error, triggers logout
```

---

## Common Development Tasks

### Task: Add a New API Endpoint

1. **Update ApiClient interface** (`IApiClient.ts`)
   ```typescript
   interface IApiClient {
     // ... existing methods ...
     getNotifications(): Promise<Notification[]>;
   }
   ```

2. **Implement in real client** (`ApiClient.ts`)
   ```typescript
   async getNotifications(): Promise<Notification[]> {
     return this.get('/api/notifications');
   }
   ```

3. **Implement in mock client** (`MockApiClient.ts`)
   ```typescript
   async getNotifications(): Promise<Notification[]> {
     return [
       { id: '1', message: 'Test notification' },
       // ... more test data
     ];
   }
   ```

4. **Use in component**
   ```typescript
   const { apiClient } = ServiceFactory.createServices('real');
   const notifications = await apiClient.getNotifications();
   ```

### Task: Add a New Screen

1. **Create file** in `src/app/`
   ```bash
   touch src/app/(protected)/notifications.tsx
   ```

2. **Define component**
   ```typescript
   export default function NotificationsScreen() {
     const { apiClient } = ServiceFactory.createServices('real');
     const [notifications, setNotifications] = useState([]);
     
     useEffect(() => {
       apiClient.getNotifications()
         .then(setNotifications)
         .catch(console.error);
     }, []);
     
     return (
       <ThemedView>
         {notifications.map(n => (
           <ThemedText key={n.id}>{n.message}</ThemedText>
         ))}
       </ThemedView>
     );
   }
   ```

3. **Add to navigation** - Expo Router finds it automatically in `src/app/`

### Task: Add a New Custom Hook

1. **Create file** in `src/hooks/`
   ```bash
   touch src/hooks/useNotifications.ts
   ```

2. **Implement hook**
   ```typescript
   export function useNotifications() {
     const [notifications, setNotifications] = useState([]);
     const [loading, setLoading] = useState(true);
     const { apiClient } = ServiceFactory.createServices('real');
     
     useEffect(() => {
       apiClient.getNotifications()
         .then(setNotifications)
         .finally(() => setLoading(false));
     }, [apiClient]);
     
     return { notifications, loading };
   }
   ```

3. **Use in component**
   ```typescript
   const { notifications, loading } = useNotifications();
   ```

### Task: Create a New Service

1. **Create interface** (`src/services/myservice/IMyService.ts`)
   ```typescript
   export interface IMyService {
     doSomething(): Promise<void>;
   }
   ```

2. **Create real implementation** (`MyService.ts`)
   ```typescript
   export class MyService implements IMyService {
     async doSomething(): Promise<void> {
       // Real implementation
     }
   }
   ```

3. **Create mock implementation** (`MockMyService.ts`)
   ```typescript
   export class MockMyService implements IMyService {
     async doSomething(): Promise<void> {
       // Mock implementation
     }
   }
   ```

4. **Wire in ServiceFactory** (`src/services/ServiceFactory.ts`)
   ```typescript
   const myService = isMock 
     ? new MockMyService() 
     : new MyService();
   
   return { myService, /* ... other services ... */ };
   ```

---

## SOLID Refactoring: Root Layout Case Study

### The Problem (Before)

Root layout (`src/app/_layout.tsx`) had **5 responsibilities**:
1. Auth initialization
2. Splash screen management
3. Theme setup
4. Navigation routing
5. Loading state management

**Result**: Hard to test, hard to modify, tight coupling

### The Solution (After)

Extracted each responsibility into separate pieces:

**Hooks** (encapsulate logic):
- `useAuthInitialization` - handles auth init only
- `useSplashController` - handles splash visibility only

**Components** (handle specific concerns):
- `ThemedLayout` - manages theming
- `RootNavigator` - manages routing
- `SetupFormUI` - handles form UI

**Result**: Each piece has ONE responsibility, easily testable, loose coupling

### Before vs After

**BEFORE (45 lines, 5 responsibilities)**:
```typescript
function RootLayoutContent() {
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    authContext.initializeFromStorage().finally(
      () => setIsReady(true)
    );
  }, [authContext]);
  
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);
  
  if (!isReady) return null;
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="setup" ... />
        <Stack.Screen name="(protected)" ... />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

**AFTER (35 lines total across 5 pieces, 1 responsibility each)**:
```typescript
function RootLayoutContent() {
  const authContext = useContext(AuthContext);
  
  const isReady = useAuthInitialization(authContext);
  useSplashController(isReady);
  
  if (!isReady) return null;
  
  return (
    <ThemedLayout>
      <RootNavigator isLoggedIn={authContext.isLoggedIn} />
    </ThemedLayout>
  );
}
```

### Benefits

| Aspect | Before | After |
|--------|--------|-------|
| SOLID Score | 2/5 | 5/5 |
| Testability | Hard | Easy |
| Lines | 45 | 35 |
| Reusability | No | Yes |
| Maintainability | Difficult | Easy |

---

## Testing Guide

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- useSetupForm

# Watch mode (re-run on file change)
npm test:watch

# Coverage report
npm test:coverage
```

### Writing Tests

**Example: useSetupForm Hook Test**

```typescript
describe('useSetupForm', () => {
  const defaultBaseUrl = 'http://localhost:3000';
  const mockOnSuccess = jest.fn().mockResolvedValue(undefined);
  
  it('should validate API key is not empty', () => {
    const { handleApiKeyChange, handleSubmit } = useSetupForm({
      defaultBaseUrl,
      onSuccess: mockOnSuccess,
    });
    
    handleApiKeyChange('');
    handleSubmit();
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  
  it('should submit with valid credentials', async () => {
    const { handleApiKeyChange, handleSubmit } = useSetupForm({
      defaultBaseUrl,
      onSuccess: mockOnSuccess,
    });
    
    handleApiKeyChange('my-api-key');
    await handleSubmit();
    
    expect(mockOnSuccess).toHaveBeenCalledWith({
      apiKey: 'my-api-key',
      baseUrl: 'http://localhost:3000',
    });
  });
});
```

### Test Organization

```
src/__tests__/
├── hooks/
│   ├── useAuthInitialization.test.ts
│   ├── useSplashController.test.ts
│   └── useSetupForm.test.ts
├── services/
│   └── auth/
│       └── AuthService.test.ts
└── components/
    └── SetupFormUI.test.tsx
```

---

## Troubleshooting

### "Invalid API key" Error

**Problem**: Setup fails with "Invalid API key"  
**Solution**:
- API key must not be empty
- Check backend `/auth/setup` endpoint is running
- Verify API key is correct
- Check server URL is reachable

### "Token refresh failed" Error

**Problem**: App logs out unexpectedly  
**Solution**:
- Refresh token may have expired (rotate every 7 days)
- Backend `/auth/refresh` endpoint may be down
- Logout and login again to get fresh tokens
- Check network connectivity

### "Cannot find module" TypeScript Error

**Problem**: Import path not found  
**Solution**:
```bash
# Check tsconfig.json has path alias
cat tsconfig.json | grep -A 5 '"paths"'

# Rebuild if needed
npm run type-check

# Restart dev server
npm start
```

### App Won't Start

**Problem**: Red error screen  
**Solution**:
```bash
# Clear cache
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Clear Expo cache
expo start -c

# Or restart completely
npm start
```

### Hot Reload Not Working

**Problem**: Changes don't appear on device  
**Solution**:
- Check file is saved (watch file system)
- Restart dev server: `npm start`
- Clear app cache in Expo Go
- Full restart: kill dev server + app, restart both

### Mock Services Not Switching

**Problem**: Still seeing mock data after changing flag  
**Solution**:
```bash
# 1. Edit src/utils/authContext.tsx
# Change: USE_MOCK_SERVICES = true   →   false

# 2. Restart dev server
npm start

# 3. Force app refresh (hard reload in Expo)

# 4. Verify:
grep USE_MOCK_SERVICES src/utils/authContext.tsx
```

---

## Performance Tips

### Optimization Checklist

- ✅ Use `useCallback` for event handlers passed to children
- ✅ Use `useMemo` for expensive computations
- ✅ Implement lazy loading for images (`FastImage`)
- ✅ Use FlatList for long lists (not ScrollView + map)
- ✅ Minimize re-renders: extract separate components
- ✅ Profile with React DevTools Profiler

### Common Performance Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| App slow | Unnecessary re-renders | Use `React.memo`, `useMemo` |
| Images lag | Large unoptimized images | Resize before upload, cache |
| API slow | Making too many requests | Batch requests, cache responses |
| Memory leak | Listeners not cleaned up | Clean up in `useEffect` return |

---

## Deployment

### Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build web
expo build:web
```

### Environment Configuration

Environment variables in `src/constants/config.ts`:

```typescript
export const getDefaultBaseUrl = () => {
  if (__DEV__) return 'http://localhost:3000';
  return 'https://api.example.com';
};
```

### Release Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables set correctly
- [ ] Backend API running
- [ ] Test auth flow end-to-end
- [ ] Check error handling
- [ ] Verify token refresh works

---

## Resources

### Documentation Links
- [Expo Router Docs](https://docs.expo.dev/routing/introduction/)
- [React Native Docs](https://reactnative.dev/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Key Files to Understand
- `src/services/ServiceFactory.ts` - DIP wiring
- `src/utils/authContext.tsx` - Auth initialization
- `src/store/slices/auth.ts` - Redux auth state
- `src/app/_layout.tsx` - Root layout

### Getting Help
```bash
# Check types
npm run type-check

# Debug with logs
grep -r "console.log" src/

# Find a service
find src/services -name "*ServiceName*"

# Check conventions
grep -r "interface I" src/services/
```

---

## Appendices

### Appendix A: File-Based Routing (Expo Router)

Expo Router uses file names as routes:

```
src/app/
├── _layout.tsx          → Root layout
├── setup.tsx            → /setup
├── (protected)/
│   ├── _layout.tsx      → Protected layout
│   ├── (tabs)/
│   │   ├── _layout.tsx  → Tabs layout
│   │   ├── index.tsx    → /(protected)/(tabs)/
│   │   └── explore.tsx  → /(protected)/(tabs)/explore
│   └── modal.tsx        → /(protected)/modal
```

**Key Patterns**:
- `_layout.tsx` - Layout wrapper, doesn't create route
- `(parentheses)` - Route groups, not in URL
- Nested = nested routes
- Index files = default for directory

### Appendix B: Redux Pattern in Use

Redux is used for global auth state:

```typescript
// Selector: get isLoggedIn from store
const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);

// Dispatch: trigger async auth action
const dispatch = useAppDispatch();
await dispatch(setupAuth({ apiKey, baseUrl }));

// Reducer: update state
authSlice.reducer (handles synchronous updates)
```

### Appendix C: Service Dependency Graph

All services and their dependencies:

```
AuthService
  ├─ depends: ApiClient
  └─ depends: StorageService
     └─ depends: SecureStorage (native)

ServiceFactory (IoC Container)
  ├─ creates: AuthService + MockAuthService
  ├─ creates: StorageService + MockStorageService
  ├─ creates: ApiClient + MockApiClient
  └─ injects all dependencies
```

### Appendix D: TypeScript Conventions

```typescript
// Interfaces (contracts)
interface IAuthService { }
interface AuthContextType { }

// Types (data shapes)
type AuthTokens = { accessToken: string; refreshToken: string };
type AuthCredentials = { apiKey: string; baseUrl: string };

// Enums (fixed values)
enum SetupStatus { INITIAL, LOADING, SUCCESS, ERROR }

// Classes (implementations)
class AuthService implements IAuthService { }
class MockAuthService implements IAuthService { }
```

### Appendix E: Error Handling Pattern

All errors wrap in ApplicationError:

```typescript
class ApplicationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage
try {
  await auth.setup(credentials);
} catch (error) {
  if (error instanceof ApplicationError) {
    if (error.statusCode === 401) {
      // Invalid credentials
    }
  }
}
```

### Appendix F: String Conventions

```typescript
// Component/Screen names: PascalCase
function HomeScreen() { }
function NotificationsScreen() { }

// Hook names: camelCase with "use" prefix
function useAuthInitialization() { }
function useSetupForm() { }

// Service names: PascalCase
class AuthService { }
interface IAuthService { }

// File names: match export name
AuthService.ts exports class AuthService
IAuthService.ts exports interface IAuthService
useSetupForm.ts exports function useSetupForm
HomeScreen.tsx exports function HomeScreen
```

### Appendix G: Import Paths

Using path aliases from `tsconfig.json`:

```typescript
// ❌ DON'T: Relative paths
import { AuthService } from '../../../services/auth/AuthService';

// ✅ DO: Path aliases
import { AuthService } from '@/services/auth/AuthService';
import { useSetupForm } from '@/hooks/useSetupForm';
import { IAuthService } from '@/services/auth/IAuthService';
```

### Appendix H: Code Organization Best Practices

**Single Responsibility**:
- One concept per file
- One export (usually)
- Clear, focused purpose

**DRY (Don't Repeat Yourself)**:
- Extract duplicated logic to hooks
- Create reusable components
- Use service abstractions

**KISS (Keep It Simple)**:
- Avoid premature optimization
- Write readable code first
- Refactor when pattern emerges

**Testing First**:
- Write tests alongside code
- Separate logic from UI
- Mock dependencies
