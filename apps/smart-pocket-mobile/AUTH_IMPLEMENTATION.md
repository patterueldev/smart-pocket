# Smart Pocket Mobile - Authentication Implementation

## Overview

This document explains the secure token-based authentication system implemented in Smart Pocket Mobile using Expo Secure Storage and axios interceptors.

## Architecture

### Key Components

1. **AuthContext** (`src/utils/authContext.tsx`)
   - Central state management for authentication
   - Manages login/logout flows and token state
   - Provides access to auth operations throughout the app

2. **AuthService** (`src/services/AuthService.ts`)
   - Business logic for authentication operations
   - Handles setup (API key + URL exchange)
   - Manages token refresh and logout
   - Loads stored auth state on startup

3. **StorageService** (`src/services/StorageService.ts`)
   - Secure token and credential storage using Expo Secure Store
   - Encrypted at OS level
   - Never exposes tokens in logs or AsyncStorage

4. **ApiClient** (`src/services/ApiClient.ts`)
   - HTTP client built on axios
   - Automatic authorization header attachment
   - Interceptor for reactive 401 token refresh
   - Silent retry of failed requests after refresh

5. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Custom React hook for type-safe auth context access
   - Ensures proper error handling and context availability

## Authentication Flow

### User Setup Flow

```
Setup Screen
  ↓ (User enters API Key + Server URL)
  ↓
AuthContext.setup()
  ↓
AuthService.setup()
  ↓
POST /auth/setup (with API key)
  ↓ (Backend validates, returns tokens)
  ↓
StorageService saves tokens securely
  ↓
ApiClient initialized with tokens
  ↓
Navigate to Dashboard
```

### App Startup Flow

```
App starts
  ↓
RootLayout initializes AuthProvider
  ↓
AuthContext.initializeFromStorage()
  ↓
AuthService.loadStoredAuth()
  ↓
StorageService retrieves encrypted tokens
  ↓
ApiClient initialized if tokens exist
  ↓
Render Setup Screen (no tokens)
   OR
Render Dashboard (tokens restored)
```

### Token Refresh Flow (Reactive)

```
API Request
  ↓
ApiClient attaches Authorization header
  ↓
POST/GET/etc
  ↓
Response 401?
  ├─ No → Success
  └─ Yes
      ↓
      Refresh Token
      ↓
      POST /auth/refresh
      ↓
      New Access Token received
      ↓
      Update Authorization header
      ↓
      Retry original request
      ↓
      Success OR Logout on refresh failure
```

## Usage

### Using Authentication in Components

```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <ActivityIndicator />;
  }

  if (!auth.isLoggedIn) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View>
      <Text>Welcome! Token: {auth.accessToken?.substring(0, 10)}...</Text>
      <Button title="Logout" onPress={() => auth.logout()} />
    </View>
  );
}
```

### Making API Calls

```typescript
import { ApiClient } from '@/services/ApiClient';

export async function fetchUserData() {
  try {
    // Tokens are automatically attached
    const data = await ApiClient.get<UserData>('/api/user');
    return data;
  } catch (error) {
    // Handle error (401 is automatically handled via refresh)
    const apiError = handleApiError(error);
    console.error(apiError.message);
  }
}
```

### Manual Token Operations

```typescript
import { StorageService } from '@/services/StorageService';

// Get current tokens
const tokens = await StorageService.getTokens();

// Get base URL
const baseUrl = await StorageService.getBaseUrl();

// Update access token (usually done automatically)
await StorageService.updateAccessToken(newToken);

// Clear all auth data (logout)
await StorageService.clearAll();
```

## Security Considerations

### ✅ Secure Practices Implemented

- **Encrypted Storage**: Tokens stored via Expo Secure Store (OS-level encryption)
- **No AsyncStorage**: Tokens never stored in plain text or AsyncStorage
- **No Hardcoding**: Credentials loaded from secure storage at startup
- **Automatic Cleanup**: Full logout clears all sensitive data
- **Silent Refresh**: User experience uninterrupted by token management
- **No Console Logs**: Tokens never logged to console
- **Reactive Refresh**: Only refresh on actual 401, not proactively

### ⚠️ Important Notes

- **Do NOT** log tokens to console
- **Do NOT** store tokens in AsyncStorage
- **Do NOT** pass tokens in URLs or query parameters
- **Do NOT** hardcode API keys in code
- **Refresh Token Security**: Refresh token should have long expiration (or not expire)
  - If refresh token expires, user must re-authenticate via Setup screen
  - Consider implementing refresh token rotation on backend

## API Contract

### Setup Endpoint

**Request**:
```
POST /auth/setup
Content-Type: application/json

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

**Error Responses**:
- `401 Unauthorized`: Invalid API key
- `400 Bad Request`: Missing or invalid fields
- `500 Server Error`: Server error

### Refresh Token Endpoint

**Request**:
```
POST /auth/refresh
Content-Type: application/json

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

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token
- `500 Server Error`: Server error

## Error Handling

### Built-in Error Handling

The app handles:
- ✅ Network timeouts
- ✅ Connection refused (server down)
- ✅ 401 Unauthorized (automatic refresh)
- ✅ 403 Forbidden
- ✅ 404 Not Found
- ✅ 5xx Server Errors
- ✅ Invalid API keys
- ✅ Session expiration

### Using Error Utilities

```typescript
import { handleApiError, isSessionExpired } from '@/utils/apiError';

try {
  const data = await ApiClient.get('/api/data');
} catch (error) {
  const apiError = handleApiError(error);
  
  if (isSessionExpired(apiError)) {
    // Handle logout
  } else {
    // Show user-friendly message
    showErrorMessage(apiError.message);
  }
}
```

## Testing

### Manual Testing Steps

1. **Setup**:
   - Run app on simulator/device
   - Enter valid API key (min 10 chars)
   - Enter server URL (default: http://localhost:3000)
   - Tap Continue

2. **Verify Secure Storage**:
   - Restart app
   - Should automatically log in (no Setup screen)
   - Tokens restored from secure storage

3. **Test API Calls**:
   - Make API calls from dashboard
   - Authorization header should be automatically attached
   - Token refresh should be automatic on 401

4. **Test Logout**:
   - Tap Logout button
   - Should redirect to Setup screen
   - Tokens should be cleared
   - Restarting app should show Setup screen

5. **Test Error Handling**:
   - Try invalid API key → Should show error message
   - Try unreachable server → Should show network error
   - Manually expire token → App should refresh automatically

## File Structure

```
src/
├── types/auth.ts                    # Type definitions
├── services/
│   ├── StorageService.ts            # Secure token storage
│   ├── AuthService.ts               # Auth business logic
│   └── ApiClient.ts                 # HTTP client with interceptors
├── hooks/useAuth.ts                 # Custom auth hook
├── utils/
│   ├── authContext.tsx              # React context provider
│   └── apiError.ts                  # Error handling utilities
└── app/
    ├── setup.tsx                    # Setup screen (API key + URL)
    ├── login.tsx                    # Fallback logout screen
    ├── _layout.tsx                  # Root layout with auth init
    └── (protected)/                 # Protected routes
        ├── _layout.tsx
        └── (tabs)/
```

## Best Practices

### For Components

```typescript
// ✅ DO: Use useAuth hook
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const auth = useAuth();
  // ...
};

// ❌ DON'T: Use useContext directly
const MyComponent = () => {
  const auth = useContext(AuthContext);
  // ...
};
```

### For API Calls

```typescript
// ✅ DO: Use ApiClient
const data = await ApiClient.get('/api/endpoint');

// ❌ DON'T: Use axios directly without context
const data = await axios.get('http://localhost:3000/api/endpoint');
```

### For Token Access

```typescript
// ✅ DO: Access token from context (for display only)
const { accessToken } = useAuth();

// ❌ DON'T: Try to access token from storage directly in components
// ❌ DON'T: Log tokens or credentials
```

## Troubleshooting

### "Session expired. Please log in again"
- Refresh token is invalid or expired
- User must re-authenticate via Setup screen
- Check backend refresh endpoint implementation

### "Unable to reach the server"
- Server URL is incorrect or server is down
- Check network connectivity
- Verify server is running and accessible

### App loops back to Setup on every restart
- Tokens not being saved to secure storage
- Check that `StorageService.saveTokens()` is being called
- Verify Expo Secure Store is properly initialized

### "Invalid API key"
- API key format is incorrect
- API key doesn't exist or is revoked
- Backend validation is failing
- Check backend `/auth/setup` implementation

## Future Enhancements

- [ ] Biometric authentication (Face ID / Fingerprint)
- [ ] Token expiration countdown and proactive refresh
- [ ] Offline-first mode with token caching
- [ ] Multi-account support
- [ ] Remember me / persistent login option
- [ ] Password reset flow
- [ ] 2FA support

## References

- [Expo Secure Store Documentation](https://docs.expo.dev/modules/secure-store/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Context API](https://react.dev/reference/react/createContext)
- [Authentication Best Practices](https://owasp.org/www-project-web-security-testing-guide/)
