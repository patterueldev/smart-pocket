/**
 * MockAuthService: Mock authentication service for testing and development.
 * Simulates auth flow without requiring a real backend.
 * Perfect for development when backend is not ready yet.
 */

import type { IAuthService } from './IAuthService';
import type { IStorageService } from '../storage/IStorageService';
import type { AuthCredentials, AuthTokens } from '@/types/auth';

export class MockAuthService implements IAuthService {
  constructor(private storageService: IStorageService) {}

  async setup(credentials: AuthCredentials): Promise<AuthTokens> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate inputs
    if (!credentials.apiKey || credentials.apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }

    if (!credentials.baseUrl) {
      throw new Error('Invalid base URL');
    }

    // Generate mock tokens
    const tokens: AuthTokens = {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 3600,
    };

    // Save to storage
    await Promise.all([
      this.storageService.saveTokens(tokens),
      this.storageService.saveCredentials(credentials),
    ]);

    console.log('[MockAuthService] Setup successful with credentials:', {
      apiKey: credentials.apiKey.substring(0, 5) + '...',
      baseUrl: credentials.baseUrl,
    });

    return tokens;
  }

  async refreshAccessToken(): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newAccessToken = `mock_access_${Date.now()}`;

    // Update stored access token
    await this.storageService.updateAccessToken(newAccessToken);

    console.log('[MockAuthService] Token refreshed');

    return newAccessToken;
  }

  async logout(): Promise<void> {
    await this.storageService.clearAll();
    console.log('[MockAuthService] Logged out');
  }

  async loadStoredAuth(): Promise<{
    tokens: AuthTokens | null;
    credentials: AuthCredentials | null;
  }> {
    const [tokens, credentials] = await Promise.all([
      this.storageService.getTokens(),
      this.storageService.getCredentials(),
    ]);

    console.log('[MockAuthService] Loaded stored auth:', {
      hasTokens: !!tokens,
      hasCredentials: !!credentials,
    });

    return { tokens, credentials };
  }
}
