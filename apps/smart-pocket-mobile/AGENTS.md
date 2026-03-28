# Smart Pocket Mobile - Developer & AI Agent Guide

Comprehensive guide for developing the Smart Pocket Mobile app (Expo + React Native + TypeScript).

---

## 🤖 FOR AI AGENTS: Essential Quick Reference

**Read this first.** Everything else is detailed docs.

| What You Need | Location | Lines |
|---|---|---|
| **Architecture patterns** | [§ SOLID Architecture Essentials](#solid-architecture-essentials) | 10 min |
| **Service interfaces** | `src/services/` (auth/, storage/, api/) | 3 files each |
| **Adding a feature** | [§ Common Development Tasks](#-common-development-tasks) | Fast reference |
| **Project structure** | [§ Project Structure Details](#-project-structure-details) | Quick lookup |
| **Auth flow** | [§ Authentication System](#-authentication-system) | Diagram + code |
| **API calls** | [§ Making API Calls](#-making-api-calls) | Code example |
| **Full details** | Appendices A-H | Deep dives |

**Key Conventions:**
- **Interfaces**: `IServiceName` (e.g., `IAuthService`)
- **Implementations**: `ServiceName` (real) + `MockServiceName` (mock)
- **Services created via**: `ServiceFactory.createServices('real'|'mock')`
- **Currently using**: Mock services (backend not ready)
- **Switch to real**: Change `USE_MOCK_SERVICES = false` in `src/utils/authContext.tsx`

**Critical Files:**
- `src/services/ServiceFactory.ts` - DIP implementation (all services wired here)
- `src/utils/authContext.tsx` - App auth state initialization
- `src/services/auth/IAuthService.ts` - Auth contract
- `src/services/api/IApiClient.ts` - HTTP client contract

**No Context? Just grep this:**
```bash
# Find service implementations
find src/services -name "*.ts" -type f

# Check current mock/real setting
grep USE_MOCK_SERVICES src/utils/authContext.tsx

# TypeScript errors?
npm run type-check
```

---

## 🎯 Quick Navigation (Humans)

**What are you doing?**

- **[First time setup?](#-getting-started)** → Start here
- **[Making a new feature?](#-common-development-tasks)** → Development tasks
- **[Understanding authentication?](#-authentication-system)** → Auth section
- **[Understanding services/SOLID?](#-solid-architecture-essentials)** → Architecture section
- **[Troubleshooting?](#-troubleshooting)** → Troubleshooting section

---

## 🎯 SOLID Architecture Essentials

**Everything you need to know to make changes without reading 1000 lines.**

### Dependency Inversion Principle (DIP)

```
NOT THIS (bad):        DO THIS (good):
Component               Component
  ↓                       ↓
AuthService          IAuthService (interface)
  ↓                       ↓
Hard-coded to              Real or Mock impl
  one impl                 - Can switch easily
                           - Testable
```

**In code**: Use `ServiceFactory.createServices('real'|'mock')` instead of instantiating services directly.

### Liskov Substitution Principle (LSP)

All implementations of a service interface are **substitutable**:
- `MockAuthService` can replace `AuthService` without changing component code
- `MockApiClient` can replace `ApiClient` without changing component code
- Same contract = same behavior expectations

### Three Service Types (Required)

Every service has three implementations:

1. **Interface** (`I ServiceName.ts`) - Defines the contract
2. **Real** (`ServiceName.ts`) - Production implementation
3. **Mock** (`MockServiceName.ts`) - Development/testing

### Current Setup

✅ All 3 service types exist  
✅ ServiceFactory wires dependencies  
✅ Using mocks in development (`USE_MOCK_SERVICES = true`)  
✅ Switch to real: Set `USE_MOCK_SERVICES = false` in `src/utils/authContext.tsx`  
✅ No other code changes needed when switching!

### Key Files

| File | Purpose |
|------|---------|
| `src/services/ServiceFactory.ts` | **Wires all dependencies (DIP hub)** |
| `src/services/auth/` | Auth service (interface + 2 impls) |
| `src/services/storage/` | Storage service (interface + 2 impls) |
| `src/services/api/` | HTTP client (interface + 2 impls) |
| `src/utils/authContext.tsx` | Creates services via factory |

### What To Do Next

- **Adding a feature?** → Jump to [Common Development Tasks](#-common-development-tasks)
- **Need details on services?** → See [Services Architecture](#-services-architecture--solid) (detailed)
- **Need auth details?** → See [Authentication System](#-authentication-system)
- **Need to create a new service?** → See [Appendix C: Service Dependency Graph](#appendix-c-service-dependency-graph)

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (verify with `node --version`)
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
# Check TypeScript compilation
npm run type-check

# Run linter
npm run lint

# All should pass without errors
```

---

## 🏗️  Architecture Overview

**Quick version** - for full folder structure, see [Project Structure Details](#-project-structure-details).

```
src/
├── app/           ← Expo Router (navigation)
├── services/      ← Business logic (3 types: auth, storage, api)
├── components/    ← Reusable UI components
├── hooks/         ← Custom React hooks
├── utils/         ← Utilities (authContext.tsx, errors)
├── types/         ← TypeScript interfaces
└── constants/     ← App configuration
```

**Key Takeaway**: Services are wired via `ServiceFactory` for dependency injection. Everything follows SOLID principles (see [SOLID Architecture Essentials](#-solid-architecture-essentials)).

---

## 🔐 Authentication System

### Overview

The app uses **secure token-based authentication** with automatic token refresh on 401 errors. Tokens are encrypted at the OS level using Expo Secure Store.

### Authentication Flow

#### User Setup (First Time)

```
User opens app
  ↓
AuthContext initializes
  ↓
Checks for stored tokens
  ↓
No tokens found?
  ↓
Show Setup Screen
  ↓
User enters: API Key + Server URL
  ↓
POST /auth/setup (with API key)
  ↓
Backend validates, returns tokens
  ↓
Tokens saved to secure storage
  ↓
ApiClient initialized with token
  ↓
Navigate to Dashboard
```

#### App Startup (Subsequent Times)

```
App starts
  ↓
AuthContext.initializeFromStorage()
  ↓
Tokens found in secure storage?
  ├─ Yes → Initialize ApiClient → Show Dashboard
  └─ No → Show Setup Screen
```

#### Token Refresh (Automatic)

```
API Request
  ↓
ApiClient attaches Authorization header
  ↓
Response 401 Unauthorized?
  ├─ No → Return data
  └─ Yes
      ↓
      POST /auth/refresh (with refresh token)
      ↓
      New access token received
      ↓
      Update Authorization header
      ↓
      Retry original request
      ↓
      Success OR Logout on failure
```

### Core Components

#### AuthContext (`src/utils/authContext.tsx`)

Central hub for authentication state and operations.

```typescript
// Access auth in any component
const auth = useAuth();

// Available methods & state
auth.isLoggedIn       // boolean
auth.isLoading        // boolean
auth.error            // string | null
auth.accessToken      // string | null
auth.refreshToken     // string | null
auth.baseUrl          // string | null

// Available methods
await auth.setup(credentials)              // Setup with API key
await auth.logout()                        // Clear all auth
auth.clearError()                          // Clear error message
await auth.initializeFromStorage()         // Restore from storage
```

#### AuthService (`src/services/auth/`)

Business logic for authentication operations.

- **Interface**: `IAuthService` - Defines contract
- **Real**: `AuthService` - Calls backend API
- **Mock**: `MockAuthService` - Simulates responses (for dev)

```typescript
// Setup authentication
const tokens = await authService.setup({ apiKey: 'xxx', baseUrl: 'http://...' });

// Refresh token when expired
const newToken = await authService.refreshAccessToken(baseUrl, refreshToken);

// Logout and clear data
await authService.logout();

// Load stored auth (on app startup)
const { tokens, credentials } = await authService.loadStoredAuth();
```

#### StorageService (`src/services/storage/`)

Secure encrypted storage for tokens and credentials.

- **Interface**: `IStorageService` - Defines contract
- **Real**: `StorageService` - Uses Expo Secure Store (encrypted)
- **Mock**: `MockStorageService` - In-memory (for testing)

```typescript
// Save tokens
await storage.saveTokens({ accessToken: '...', refreshToken: '...', expiresIn: 3600 });

// Retrieve tokens
const tokens = await storage.getTokens();

// Update just the access token
await storage.updateAccessToken(newToken);

// Clear everything
await storage.clearAll();
```

#### ApiClient (`src/services/api/`)

HTTP client with automatic authorization and token refresh.

- **Interface**: `IApiClient` - Defines contract
- **Real**: `ApiClient` - Uses axios with interceptors
- **Mock**: `MockApiClient` - Logs requests (for testing)

```typescript
// Initialize with base URL and token
await apiClient.initialize('http://localhost:3000', accessToken);

// Make requests (token is automatically attached)
const users = await apiClient.get<User[]>('/users');
const newUser = await apiClient.post<User>('/users', userData);
const updated = await apiClient.put<User>('/users/1', updateData);
await apiClient.delete('/users/1');

// Update token after refresh
apiClient.updateAccessToken(newToken);

// Reset on logout
apiClient.reset();
```

### Using Authentication in Components

```typescript
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View, Text, Button } from 'react-native';

export function MyComponent() {
  const auth = useAuth();

  // Show loading state
  if (auth.isLoading) {
    return <ActivityIndicator />;
  }

  // Show error if auth failed
  if (auth.error) {
    return (
      <View>
        <Text>Error: {auth.error}</Text>
        <Button title="Try Again" onPress={auth.clearError} />
      </View>
    );
  }

  // Show not logged in
  if (!auth.isLoggedIn) {
    return <Text>Please log in</Text>;
  }

  // Show logged in content
  return (
    <View>
      <Text>Welcome! Token: {auth.accessToken?.substring(0, 10)}...</Text>
      <Button title="Logout" onPress={auth.logout} />
    </View>
  );
}
```

### Making API Calls

```typescript
import { useContext } from 'react';
import { ApiClient } from '@/services';

export async function fetchUserData() {
  try {
    // Token is automatically attached to requests
    const data = await ApiClient.get<UserData>('/api/user');
    return data;
  } catch (error) {
    // 401 errors are handled automatically (token refresh)
    // Other errors are thrown
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

### API Contract

The app expects these backend endpoints:

#### POST /auth/setup

**Request**:
```json
{
  "apiKey": "user-provided-api-key"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600
}
```

**Errors**:
- `401` - Invalid API key
- `400` - Missing/invalid fields
- `500` - Server error

#### POST /auth/refresh

**Request**:
```json
{
  "refreshToken": "eyJ..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJ..."
}
```

**Errors**:
- `401` - Invalid or expired refresh token
- `500` - Server error

### Security Best Practices

✅ **DO:**
- Use `useAuth` hook for accessing auth state
- Use `ApiClient` for all API calls
- Access tokens only for display purposes
- Clear tokens on logout
- Handle 401 errors gracefully

❌ **DON'T:**
- Log tokens to console
- Store tokens in AsyncStorage
- Hardcode API keys
- Pass tokens in URLs
- Directly use axios without context

---

## 🏗️  Services Architecture & SOLID

**Note**: See [SOLID Architecture Essentials](#-solid-architecture-essentials) above for quick reference.

The services layer uses **Dependency Inversion** and **Liskov Substitution** principles.

### Three Service Types

All services follow this pattern (interface + real + mock):

```
auth/      storage/      api/
├─ IAuthService         ├─ IStorageService    ├─ IApiClient
├─ AuthService          ├─ StorageService     ├─ ApiClient
├─ MockAuthService      ├─ MockStorageService └─ MockApiClient
└─ index.ts             └─ index.ts
```

### Using Services

```typescript
// Services are created in src/utils/authContext.tsx via ServiceFactory
import { ServiceFactory } from '@/services';

const services = ServiceFactory.createServices('mock'); // or 'real'
const { authService, apiClient, storageService } = services;

// Use in components via context
const { authService } = useAuth();
```

### Why Mock Services?

**Current**: `USE_MOCK_SERVICES = true` in `src/utils/authContext.tsx`  
**Reason**: Backend not ready yet  
**To switch**: Change one line to `false` - no other code changes needed

**See [Appendix C](#appendix-c-service-dependency-graph) for detailed dependency graph and extending services.**

---
  async set<T>(key: string, value: T): Promise<void> {
    // Implementation
  }

  async clear(): Promise<void> {
    // Implementation
  }
}
```

3. **Create mock** (`src/services/cache/MockCacheService.ts`):
```typescript
export class MockCacheService implements ICacheService {
  private cache: Record<string, any> = {};

  async get<T>(key: string): Promise<T | null> {
    return this.cache[key] ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.cache[key] = value;
  }

  async clear(): Promise<void> {
    this.cache = {};
  }
}
```

4. **Update factory** (`src/services/ServiceFactory.ts`):
```typescript
import { ICacheService, CacheService, MockCacheService } from './cache';

export interface IServices {
  authService: IAuthService;
  storageService: IStorageService;
  apiClient: IApiClient;
  cacheService: ICacheService;  // Add this
}

static createServices(mode: ServiceMode = 'real'): IServices {
  // ... existing services ...

  const cacheService =
    mode === 'mock'
      ? new MockCacheService()
      : new CacheService();

  return {
    authService,
    storageService,
    apiClient,
    cacheService,  // Add this
  };
}
```

### Testing with Mocks

```typescript
import { ServiceFactory } from '@/services';

// Create mock services for testing
const mockServices = ServiceFactory.createServices('mock');
const { authService, storageService } = mockServices;

// Use in tests
const tokens = await authService.setup({ apiKey: 'test', baseUrl: 'http://localhost:3000' });
// Returns immediately with mock tokens - no network call!
```

---

## 🎨 Components & UI

### Component Patterns

All UI components are **pure** - they receive data via props and render UI.

#### Basic Component Template

```typescript
// src/components/my-component.tsx
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <ThemedText>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

#### Using Themed Components

```typescript
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function MyScreen() {
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText>Light/Dark aware text</ThemedText>
    </ThemedView>
  );
}
```

### Available Components

- **ThemedText** - Text with theme support
- **ThemedView** - View with theme support
- **ExternalLink** - Link component
- **HelloWave** - Animated wave
- **ParallaxScrollView** - Scroll view with header

---

## 📱 Common Development Tasks

### Add a New Screen

1. **Create the screen file**:
```typescript
// src/app/my-feature.tsx
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';

export default function MyFeatureScreen() {
  const auth = useAuth();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText>My Feature</ThemedText>
    </ThemedView>
  );
}
```

2. **File-based routing handles it automatically** - Expo Router creates the route based on file location

3. **Link to it from another screen**:
```typescript
import { Link } from 'expo-router';

<Link href="/my-feature">Go to My Feature</Link>
```

### Add a New Component

```typescript
// src/components/my-component.tsx
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export interface MyComponentProps {
  label: string;
}

export function MyComponent({ label }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <ThemedText>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
```

### Make an API Call

```typescript
import { useEffect, useState } from 'react';
import { ApiClient } from '@/services';

interface User {
  id: string;
  name: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.get<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Use Custom Hooks

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/use-theme-color';

export function MyScreen() {
  const auth = useAuth();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={{ backgroundColor }}>
      {auth.isLoggedIn && <Text>User is logged in</Text>}
    </View>
  );
}
```

---

## 🌍 Environment Configuration

The app supports three environments: **Development**, **QA**, and **Production**. Each has different:
- API endpoints
- Bundle IDs (for iOS/Android)
- App names

### Environment Setup

```bash
# Development
APP_ENV=dev npm start

# QA/Staging
APP_ENV=qa npm start

# Production (default)
npm start
# or
APP_ENV=prod npm start
```

### Environment Details

| Env | iOS Bundle ID | Android Package | API Endpoint |
|-----|---|---|---|
| **dev** | `dev.patteruel.smartpocket.dev` | `dev.patteruel.smartpocket.dev` | https://smartpocket-dev.nicenature.space |
| **qa** | `dev.patteruel.smartpocket.qa` | `dev.patteruel.smartpocket.qa` | https://smartpocket-qa.nicenature.space |
| **prod** | `dev.patteruel.smartpocket` | `dev.patteruel.smartpocket` | https://smartpocket.patteruel.dev |

### Multiple Versions on Same Device

Since each environment has a unique bundle ID, you can install all three:

```
Device
├── Smart Pocket Dev (dev.patteruel.smartpocket.dev)
├── Smart Pocket QA (dev.patteruel.smartpocket.qa)
└── Smart Pocket (dev.patteruel.smartpocket)
```

Perfect for testing across environments!

### Configuration Files

- **app.config.js** - Dynamic configuration (reads APP_ENV)
- **src/constants/config.ts** - Loads configuration at runtime

### Building for Environments

```bash
# Using EAS
eas build --platform ios --profile dev
eas build --platform android --profile qa
eas build --platform ios --profile prod

# Or with environment variable
APP_ENV=dev eas build --platform ios
```

---

## 🧪 Testing & Quality

### Type Checking

```bash
npm run type-check
```

Verify TypeScript has no errors.

### Linting

```bash
npm run lint
```

Check code style and potential issues.

### Running Tests

```bash
npm run test
```

(Test setup available when needed)

### Development Server

```bash
npm start
```

Starts Expo CLI with hot reload enabled.

---

## 📚 Project Structure Details

### src/app/ - Navigation (Expo Router)

File-based routing. Each `.tsx` file becomes a route.

```
src/app/
├── _layout.tsx           # Root layout (auth provider)
├── setup.tsx             # /setup - Auth setup screen
└── (protected)/          # Protected routes (require auth)
    ├── _layout.tsx
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx     # Home screen
    │   └── explore.tsx   # Explore screen
    └── modal.tsx         # Modal screen
```

### src/services/ - Business Logic

Encapsulates backend communication and data persistence.

```
src/services/
├── auth/                 # Authentication
├── storage/              # Secure storage
├── api/                  # HTTP client
├── ServiceFactory.ts     # DIP factory
└── index.ts             # Exports
```

### src/components/ - UI Components

Reusable, pure React components.

```
src/components/
├── themed-text.tsx
├── themed-view.tsx
├── external-link.tsx
├── hello-wave.tsx
└── ui/                   # Low-level UI
    ├── collapsible.tsx
    └── icon-symbol.tsx
```

### src/hooks/ - Custom Hooks

Reusable React logic.

```
src/hooks/
├── useAuth.ts            # Auth context access
├── use-theme-color.ts    # Theme color resolution
└── use-color-scheme.ts   # Device color scheme
```

### src/utils/ - Utilities

Helper functions and context.

```
src/utils/
├── authContext.tsx       # Auth state management
└── apiError.ts           # Error handling
```

### src/types/ - TypeScript Definitions

Type definitions and interfaces.

```
src/types/
├── auth.ts               # Auth-related types
└── index.ts             # Type exports
```

---

## 🚀 Build & Deployment

### Development Build

```bash
npm start
```

### Production Build (Local)

```bash
eas build --platform ios --profile prod
eas build --platform android --profile prod
```

### CI/CD Integration

Use `APP_ENV` environment variable in GitHub Actions:

```yaml
- name: Build
  run: APP_ENV=prod eas build --platform ios
```

---

## 🐛 Troubleshooting

### "Module not found" errors

**Problem**: Import path is wrong  
**Solution**: Use `@/` alias for imports from src/
```typescript
// ✅ Correct
import { useAuth } from '@/hooks/useAuth';

// ❌ Wrong
import { useAuth } from '../hooks/useAuth';
```

### "Cannot find module authContext"

**Problem**: Import path wrong or file doesn't exist  
**Solution**: Check the path and file name
```typescript
// Check file exists: src/utils/authContext.tsx
import { AuthContext } from '@/utils/authContext';
```

### App shows "Setup Screen" after restart

**Problem**: Tokens not being saved  
**Solution**: Ensure `StorageService` is initialized correctly
- Verify Expo Secure Store is available
- Check `authContext.tsx` is calling `setup()`
- Look for errors in console

### "Invalid API key" error

**Problem**: API key validation failed  
**Solution**:
- API key must be at least 10 characters
- Check backend `/auth/setup` endpoint
- Verify API key is correct in setup form

### TypeScript errors

**Problem**: Type checking fails  
**Solution**:
```bash
npm run type-check
```

Check error messages for type mismatches. Fix type annotations.

### Linting errors

**Problem**: Code style issues  
**Solution**:
```bash
npm run lint
```

Fix errors according to ESLint rules.

### App won't start

**Problem**: Build or runtime error  
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start
```

---

## 📖 Code Examples

### Complete Setup Flow

```typescript
// src/app/setup.tsx
import { useContext, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { AuthContext } from '@/utils/authContext';

export default function SetupScreen() {
  const auth = useContext(AuthContext);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  const handleSetup = async () => {
    try {
      await auth.setup({ apiKey, baseUrl });
      // Auto-navigates to dashboard on success
    } catch (error) {
      // Error is in auth.error
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
      />
      <TextInput
        placeholder="Server URL"
        value={baseUrl}
        onChangeText={setBaseUrl}
      />
      <TouchableOpacity onPress={handleSetup} disabled={auth.isLoading}>
        <Text>{auth.isLoading ? 'Setting up...' : 'Continue'}</Text>
      </TouchableOpacity>
      {auth.error && <Text style={{ color: 'red' }}>{auth.error}</Text>}
    </View>
  );
}
```

### Complete Data Fetching

```typescript
// src/app/(protected)/(tabs)/index.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { ApiClient } from '@/services';

interface Item {
  id: string;
  name: string;
}

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.get<Item[]>('/items');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 🎯 Next Steps

### For Developers

1. ✅ Follow getting started above
2. ✅ Explore the directory structure
3. ✅ Run the app locally
4. ✅ Make a small change and hot-reload
5. ✅ Review authentication system
6. ✅ Look at existing screens/components
7. ✅ Start building features!

### For AI Agents

1. ✅ Read this entire AGENTS.md file
2. ✅ Review the services architecture (DIP/LSP)
3. ✅ Check naming conventions (I*, Real, Mock)
4. ✅ Examine existing components and patterns
5. ✅ Follow the established patterns when creating code
6. ✅ Run type-check and linting before submitting
7. ✅ Update tests and documentation as needed

### For Features

When adding features:

1. **Create the types** - Define interfaces in `src/types/`
2. **Create the service** - Business logic in `src/services/`
3. **Create components** - UI in `src/components/`
4. **Create screens** - Routes in `src/app/`
5. **Add hooks** - Reusable logic in `src/hooks/`
6. **Test locally** - Verify on simulator/device
7. **Check quality** - Run linting and type-checking

---

## 📋 Summary

This is the complete guide for developing Smart Pocket Mobile. Key points:

✅ **Architecture** - Services with DIP, clean components, custom hooks  
✅ **Authentication** - Secure token storage with automatic refresh  
✅ **Services** - Three implementations: Interface, Real, Mock  
✅ **Development** - Hot reload, TypeScript strict mode, full type safety  
✅ **Environments** - Dev/QA/Prod with different endpoints  
✅ **Quality** - Linting, type-checking, code standards  

The app is production-ready with a solid foundation for future growth.

---

## 🔗 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **TypeScript Guide**: https://www.typescriptlang.org/
- **Axios Docs**: https://axios-http.com/
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID

---

**Last Updated**: 2026-03-28  
**Status**: Production Ready  
**For**: Human Developers & AI Agents  

---

## 📎 APPENDIX A: Detailed Authentication Flows

### User Setup Flow (Detailed)

```
Setup Screen → AuthContext.setup() → AuthService.setup()
  ↓ POST /auth/setup { apiKey }
  ↓ Receive: { accessToken, refreshToken, expiresIn }
  ↓ StorageService: saveTokens() + saveCredentials()
  ↓ ApiClient.initialize() with token
  ↓ setIsLoggedIn(true)
  ↓ router.replace('/(protected)/(tabs)')
```

### Token Refresh Flow (Detailed)

```
API Request with Authorization header
  ↓ Response 401?
  ├─ No → Return data
  └─ Yes → StorageService.getTokens()
     ↓ AuthService.refreshAccessToken()
     ↓ POST /auth/refresh { refreshToken }
     ↓ Update Authorization header
     ↓ Retry original request
```

---

## 📎 APPENDIX B: Environment Configuration Details

Environment variables control which API endpoints and bundle IDs are used:

```bash
APP_ENV=dev   # Development (smartpocket-dev)
APP_ENV=qa    # QA/Staging (smartpocket-qa)
APP_ENV=prod  # Production (smartpocket) [default]
```

Each environment:
- Has unique bundle ID (iOS and Android)
- Points to different API endpoint
- Has unique app name on device

Multiple versions can be installed simultaneously for testing!

---

## 📎 APPENDIX C: Service Architecture

Services follow **Dependency Inversion Principle**:

```
Each Service Type:
├─ IServiceName (interface/contract)
├─ ServiceName (real implementation)
└─ MockServiceName (test/dev implementation)

Factory Pattern:
└─ ServiceFactory.createServices('mock'|'real')
   └─ Decides which implementations to use
```

Currently using **MOCK** services because backend isn't ready.  
Change one flag to switch to **REAL** when backend is ready!

---

## 📎 APPENDIX D: Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Interface | `IServiceName` | `IAuthService` |
| Real Implementation | `ServiceName` | `AuthService` |
| Mock Implementation | `MockServiceName` | `MockAuthService` |
| Factory | `ServiceFactory` | Creates instances |
| Components | `PascalCase.tsx` | `ThemedText.tsx` |
| Hooks | `camelCase.ts` (with `use`) | `useAuth.ts` |
| Types | `lowercase.ts` | `auth.ts` |
| Screens | `lowercase-kebab.tsx` | `setup.tsx` |

---

## 📎 APPENDIX E: Security Best Practices

### DO:
- ✅ Use `useAuth` hook for auth state
- ✅ Use `ApiClient` for all API calls
- ✅ Access tokens only from context
- ✅ Clear tokens on logout
- ✅ Handle 401 errors gracefully

### DON'T:
- ❌ Log tokens to console
- ❌ Store tokens in AsyncStorage
- ❌ Hardcode API keys
- ❌ Pass tokens in URLs
- ❌ Use plain HTTP for API calls

---

## 📎 APPENDIX F: Complete Component Example

```typescript
// src/components/user-card.tsx
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';

export interface UserCardProps {
  name: string;
  email: string;
  onPress?: () => void;
}

export function UserCard({ name, email, onPress }: UserCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View>
        <ThemedText type="subtitle">{name}</ThemedText>
        <ThemedText>{email}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
  },
});
```

---

## 📎 APPENDIX G: Complete Hook Example

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services';

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.get<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return { users, loading, error, refetch: fetchUsers };
}
```

---

## 📎 APPENDIX H: Complete Screen Example

```typescript
// src/app/(protected)/(tabs)/index.tsx
import { FlatList, ActivityIndicator, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { UserCard } from '@/components/user-card';
import { useUsers } from '@/hooks/useUsers';

export default function HomeScreen() {
  const { users, loading, error } = useUsers();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ThemedText style={{ color: 'red' }}>Error: {error.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserCard
            name={item.name}
            email={item.email}
            onPress={() => console.log(`Tapped ${item.name}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </ThemedView>
  );
}
```

---

**Documentation Complete! 🎉**

This AGENTS.md now serves as the comprehensive guide for:
- Human developers starting with the project
- AI agents contributing code
- Future maintainers understanding the architecture
- New team members onboarding

All information previously in separate documents is now consolidated here.

