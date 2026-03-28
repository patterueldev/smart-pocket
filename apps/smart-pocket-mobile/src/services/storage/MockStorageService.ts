/**
 * MockStorageService: In-memory mock implementation for testing and development.
 * Used when the real secure storage isn't available or for mocking auth flow.
 */

import { AuthCredentials, AuthTokens } from '@/types/auth';
import { IStorageService } from './IStorageService';

export class MockStorageService implements IStorageService {
  private tokens: AuthTokens | null = null;
  private credentials: AuthCredentials | null = null;

  async saveTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
  }

  async getTokens(): Promise<AuthTokens | null> {
    return this.tokens;
  }

  async saveCredentials(credentials: AuthCredentials): Promise<void> {
    this.credentials = credentials;
  }

  async getCredentials(): Promise<AuthCredentials | null> {
    return this.credentials;
  }

  async getBaseUrl(): Promise<string | null> {
    return this.credentials?.baseUrl ?? null;
  }

  async updateAccessToken(token: string): Promise<void> {
    if (this.tokens) {
      this.tokens.accessToken = token;
    }
  }

  async clearAll(): Promise<void> {
    this.tokens = null;
    this.credentials = null;
  }
}
