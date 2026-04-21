/**
 * AuthService: Core authentication business logic.
 * Handles setup, login, token refresh, and logout with real backend.
 */

import axios, { type AxiosError } from 'axios';
import type { IAuthService } from './IAuthService';
import type { IStorageService } from '../storage/IStorageService';
import type { AuthCredentials, AuthTokens, SetupRequest, SetupResponse } from '@/types/auth';

export class AuthService implements IAuthService {
  constructor(private storageService: IStorageService) {}

  async setup(credentials: AuthCredentials): Promise<AuthTokens> {
    try {
      console.log('[AuthService] Setup started with:', { apiKey: '***', baseUrl: credentials.baseUrl });
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

      console.log('[AuthService] Setup successful, saving to storage');
      // Save tokens and credentials to secure storage
      await Promise.all([
        this.storageService.saveTokens(tokens),
        this.storageService.saveCredentials(credentials),
      ]);

      console.log('[AuthService] Setup complete');
      return tokens;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[AuthService] Setup failed:', axiosError.message);
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

  async refreshAccessToken(baseUrl: string, refreshToken: string): Promise<string> {
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
      await this.storageService.updateAccessToken(newAccessToken);

      return newAccessToken;
    } catch {
      // If refresh fails, user must re-authenticate
      throw new Error('Failed to refresh authentication. Please log in again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.storageService.clearAll();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if clear fails, we consider logout successful
    }
  }

  async loadStoredAuth(): Promise<{
    tokens: AuthTokens | null;
    credentials: AuthCredentials | null;
  }> {
    try {
      const [tokens, credentials] = await Promise.all([
        this.storageService.getTokens(),
        this.storageService.getCredentials(),
      ]);

      return { tokens, credentials };
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      return { tokens: null, credentials: null };
    }
  }
}
