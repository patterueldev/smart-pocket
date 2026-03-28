/**
 * Authentication-related TypeScript interfaces and types.
 */

/** Credentials provided by user during setup */
export interface AuthCredentials {
  apiKey: string;
  baseUrl: string;
}

/** Tokens returned by backend authentication endpoint */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/** Complete authentication state */
export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  baseUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

/** Request body for backend setup/auth endpoint */
export interface SetupRequest {
  apiKey: string;
}

/** Response from backend setup/auth endpoint */
export interface SetupResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
