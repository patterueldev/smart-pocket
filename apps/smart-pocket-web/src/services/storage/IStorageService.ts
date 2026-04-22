/**
 * IStorageService: Interface for secure storage operations.
 * Defines contract for storing and retrieving authentication tokens and credentials.
 */

import type { AuthCredentials, AuthTokens } from '@/types/auth';

export interface IStorageService {
  /**
   * Save tokens to secure storage.
   */
  saveTokens(tokens: AuthTokens): Promise<void>;

  /**
   * Retrieve tokens from secure storage.
   * Returns null if tokens don't exist.
   */
  getTokens(): Promise<AuthTokens | null>;

  /**
   * Save credentials to secure storage.
   */
  saveCredentials(credentials: AuthCredentials): Promise<void>;

  /**
   * Retrieve credentials from secure storage.
   * Returns null if credentials don't exist.
   */
  getCredentials(): Promise<AuthCredentials | null>;

  /**
   * Get base URL from secure storage.
   */
  getBaseUrl(): Promise<string | null>;

  /**
   * Update access token only (for token refresh).
   */
  updateAccessToken(token: string): Promise<void>;

  /**
   * Clear all authentication data from secure storage.
   */
  clearAll(): Promise<void>;
}
