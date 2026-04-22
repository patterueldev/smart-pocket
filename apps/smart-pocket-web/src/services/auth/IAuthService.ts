/**
 * IAuthService: Interface for authentication operations.
 * Defines contract for setup, token refresh, and logout.
 */

import type { AuthCredentials, AuthTokens } from '@/types/auth';

export interface IAuthService {
  /**
   * Setup authentication with API key and base URL.
   * Sends credentials to backend and receives tokens in return.
   */
  setup(credentials: AuthCredentials): Promise<AuthTokens>;

  /**
   * Refresh access token using refresh token.
   * Called when access token expires.
   */
  refreshAccessToken(baseUrl: string, refreshToken: string): Promise<string>;

  /**
   * Logout: Clear all stored authentication data.
   */
  logout(): Promise<void>;

  /**
   * Load stored authentication state from persistent storage.
   * Used on app startup to restore user session.
   */
  loadStoredAuth(): Promise<{
    tokens: AuthTokens | null;
    credentials: AuthCredentials | null;
  }>;
}
