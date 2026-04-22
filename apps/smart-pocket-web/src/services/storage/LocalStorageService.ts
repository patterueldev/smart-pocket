/**
 * LocalStorageService: Implementation of IStorageService using browser localStorage.
 * Provides persistent storage for authentication tokens and credentials.
 */

import type { IStorageService } from './IStorageService';
import type { AuthCredentials, AuthTokens } from '@/types/auth';

const TOKENS_KEY = 'sp_tokens';
const CREDENTIALS_KEY = 'sp_credentials';

export class LocalStorageService implements IStorageService {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthTokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  async saveCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
      throw new Error('Failed to save credentials');
    }
  }

  async getCredentials(): Promise<AuthCredentials | null> {
    try {
      const stored = localStorage.getItem(CREDENTIALS_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthCredentials;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  async getBaseUrl(): Promise<string | null> {
    try {
      const credentials = await this.getCredentials();
      return credentials?.baseUrl || null;
    } catch (error) {
      console.error('Failed to retrieve base URL:', error);
      return null;
    }
  }

  async updateAccessToken(token: string): Promise<void> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        throw new Error('No tokens to update');
      }
      await this.saveTokens({
        ...tokens,
        accessToken: token,
      });
    } catch (error) {
      console.error('Failed to update access token:', error);
      throw new Error('Failed to update authentication token');
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(TOKENS_KEY);
      localStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear authentication data');
    }
  }
}
