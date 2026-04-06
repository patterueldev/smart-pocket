/**
 * StorageService: Secure storage implementation using Expo Secure Store.
 * Handles persistent encryption of tokens and credentials.
 */

import * as SecureStore from 'expo-secure-store';
import { AuthCredentials, AuthTokens } from '@/types/auth';
import { IStorageService } from './IStorageService';

const KEYS = {
  ACCESS_TOKEN: 'auth_accessToken',
  REFRESH_TOKEN: 'auth_refreshToken',
  EXPIRES_IN: 'auth_expiresIn',
  API_KEY: 'auth_apiKey',
  BASE_URL: 'auth_baseUrl',
};

export class StorageService implements IStorageService {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
        SecureStore.setItemAsync(KEYS.EXPIRES_IN, String(tokens.expiresIn)),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
      const expiresInStr = await SecureStore.getItemAsync(KEYS.EXPIRES_IN);

      if (!accessToken || !refreshToken || !expiresInStr) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresIn: parseInt(expiresInStr, 10),
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  async saveCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      console.log('[StorageService] Saving credentials:', { apiKey: '***', baseUrl: credentials.baseUrl });
      await Promise.all([
        SecureStore.setItemAsync(KEYS.API_KEY, credentials.apiKey),
        SecureStore.setItemAsync(KEYS.BASE_URL, credentials.baseUrl),
      ]);
      console.log('[StorageService] Credentials saved successfully');
    } catch (error) {
      console.error('[StorageService] Failed to save credentials:', error);
      throw new Error('Failed to save credentials');
    }
  }

  async getCredentials(): Promise<AuthCredentials | null> {
    try {
      const apiKey = await SecureStore.getItemAsync(KEYS.API_KEY);
      const baseUrl = await SecureStore.getItemAsync(KEYS.BASE_URL);

      console.log('[StorageService] Retrieved credentials:', { 
        hasApiKey: !!apiKey, 
        baseUrl: baseUrl || 'null' 
      });

      if (!apiKey || !baseUrl) {
        return null;
      }

      return { apiKey, baseUrl };
    } catch (error) {
      console.error('[StorageService] Failed to retrieve credentials:', error);
      return null;
    }
  }

  async getBaseUrl(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.BASE_URL);
    } catch (error) {
      console.error('Failed to retrieve base URL:', error);
      return null;
    }
  }

  async updateAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Failed to update access token:', error);
      throw new Error('Failed to update access token');
    }
  }

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(KEYS.EXPIRES_IN),
        SecureStore.deleteItemAsync(KEYS.API_KEY),
        SecureStore.deleteItemAsync(KEYS.BASE_URL),
      ]);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear authentication data');
    }
  }
}
