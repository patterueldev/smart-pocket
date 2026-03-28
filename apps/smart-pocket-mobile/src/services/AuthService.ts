/**
 * AuthService: Core authentication business logic.
 * Handles setup, login, token refresh, and logout.
 */

import axios, { AxiosError } from 'axios';
import { StorageService } from './StorageService';
import { AuthCredentials, AuthTokens, SetupRequest, SetupResponse } from '@/types/auth';

export class AuthService {
  /**
   * Setup authentication with API key and base URL.
   * Sends API key to backend and receives tokens in return.
   */
  static async setup(credentials: AuthCredentials): Promise<AuthTokens> {
    try {
      const payload: SetupRequest = {
        apiKey: credentials.apiKey,
      };

      const response = await axios.post<SetupResponse>(
        `${credentials.baseUrl}/auth/setup`,
        payload,
        {
          timeout: 10000,
        }
      );

      const tokens: AuthTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };

      // Save tokens and credentials to secure storage
      await Promise.all([
        StorageService.saveTokens(tokens),
        StorageService.saveCredentials(credentials),
      ]);

      return tokens;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid API key');
      }
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check the server URL.');
      }
      throw new Error(
        axiosError.message || 'Setup failed. Please check your credentials and server URL.'
      );
    }
  }

  /**
   * Refresh access token using refresh token.
   * Called when access token expires.
   */
  static async refreshAccessToken(baseUrl: string, refreshToken: string): Promise<string> {
    try {
      const response = await axios.post<{ accessToken: string }>(
        `${baseUrl}/auth/refresh`,
        { refreshToken },
        {
          timeout: 10000,
        }
      );

      const newAccessToken = response.data.accessToken;

      // Update stored access token
      await StorageService.updateAccessToken(newAccessToken);

      return newAccessToken;
    } catch {
      // If refresh fails, user must re-authenticate
      throw new Error('Failed to refresh authentication. Please log in again.');
    }
  }

  /**
   * Logout: Clear all stored authentication data.
   */
  static async logout(): Promise<void> {
    try {
      await StorageService.clearAll();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if clear fails, we consider logout successful
    }
  }

  /**
   * Load stored authentication state from secure storage.
   * Used on app startup to restore user session.
   */
  static async loadStoredAuth(): Promise<{
    tokens: AuthTokens | null;
    credentials: AuthCredentials | null;
  }> {
    try {
      const [tokens, credentials] = await Promise.all([
        StorageService.getTokens(),
        StorageService.getCredentials(),
      ]);

      return { tokens, credentials };
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      return { tokens: null, credentials: null };
    }
  }
}
