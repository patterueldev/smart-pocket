import { MockStorageService } from '../../../services/storage/MockStorageService';
import { AuthCredentials, AuthTokens } from '@/types/auth';

describe('MockStorageService', () => {
  let mockStorageService: MockStorageService;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
  });

  describe('saveTokens and getTokens', () => {
    it('should save and retrieve tokens', async () => {
      const tokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved).toEqual(tokens);
    });

    it('should return null when no tokens saved', async () => {
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved).toBeNull();
    });

    it('should overwrite existing tokens', async () => {
      const tokens1: AuthTokens = {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresIn: 3600,
      };
      const tokens2: AuthTokens = {
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        expiresIn: 7200,
      };

      await mockStorageService.saveTokens(tokens1);
      await mockStorageService.saveTokens(tokens2);
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved).toEqual(tokens2);
    });

    it('should support tokens with all properties', async () => {
      const tokens: AuthTokens = {
        accessToken: 'very-long-access-token-string',
        refreshToken: 'very-long-refresh-token-string',
        expiresIn: 7200,
      };

      await mockStorageService.saveTokens(tokens);
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved?.accessToken).toBe(tokens.accessToken);
      expect(retrieved?.refreshToken).toBe(tokens.refreshToken);
      expect(retrieved?.expiresIn).toBe(tokens.expiresIn);
    });
  });

  describe('saveCredentials and getCredentials', () => {
    it('should save and retrieve credentials', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key-12345',
        baseUrl: 'https://api.example.com',
      };

      await mockStorageService.saveCredentials(credentials);
      const retrieved = await mockStorageService.getCredentials();

      expect(retrieved).toEqual(credentials);
    });

    it('should return null when no credentials saved', async () => {
      const retrieved = await mockStorageService.getCredentials();

      expect(retrieved).toBeNull();
    });

    it('should overwrite existing credentials', async () => {
      const creds1: AuthCredentials = {
        apiKey: 'key-1',
        baseUrl: 'https://api1.example.com',
      };
      const creds2: AuthCredentials = {
        apiKey: 'key-2',
        baseUrl: 'https://api2.example.com',
      };

      await mockStorageService.saveCredentials(creds1);
      await mockStorageService.saveCredentials(creds2);
      const retrieved = await mockStorageService.getCredentials();

      expect(retrieved).toEqual(creds2);
    });

    it('should handle different API keys', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'sk_test_123abc456def789ghi',
        baseUrl: 'https://api.example.com',
      };

      await mockStorageService.saveCredentials(credentials);
      const retrieved = await mockStorageService.getCredentials();

      expect(retrieved?.apiKey).toBe(credentials.apiKey);
    });
  });

  describe('getBaseUrl', () => {
    it('should return baseUrl from stored credentials', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      await mockStorageService.saveCredentials(credentials);
      const baseUrl = await mockStorageService.getBaseUrl();

      expect(baseUrl).toBe('https://api.example.com');
    });

    it('should return null when no credentials saved', async () => {
      const baseUrl = await mockStorageService.getBaseUrl();

      expect(baseUrl).toBeNull();
    });

    it('should handle different base URLs', async () => {
      const testUrls = [
        'https://localhost:3000',
        'https://api.staging.example.com',
        'https://api.prod.example.com',
        'http://192.168.1.1:8080',
      ];

      for (const url of testUrls) {
        const credentials: AuthCredentials = {
          apiKey: 'test-key',
          baseUrl: url,
        };

        await mockStorageService.saveCredentials(credentials);
        const retrieved = await mockStorageService.getBaseUrl();

        expect(retrieved).toBe(url);
      }
    });
  });

  describe('updateAccessToken', () => {
    it('should update access token when tokens exist', async () => {
      const tokens: AuthTokens = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.updateAccessToken('new-token');
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved?.accessToken).toBe('new-token');
    });

    it('should preserve other token properties when updating', async () => {
      const tokens: AuthTokens = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token-value',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.updateAccessToken('new-token');
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved?.refreshToken).toBe('refresh-token-value');
      expect(retrieved?.expiresIn).toBe(3600);
    });

    it('should do nothing if no tokens exist', async () => {
      // Should not throw error
      await mockStorageService.updateAccessToken('new-token');

      const retrieved = await mockStorageService.getTokens();
      expect(retrieved).toBeNull();
    });

    it('should handle empty token updates', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.updateAccessToken('');
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved?.accessToken).toBe('');
    });
  });

  describe('clearAll', () => {
    it('should clear tokens and credentials', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };
      const credentials: AuthCredentials = {
        apiKey: 'key',
        baseUrl: 'https://api.example.com',
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.saveCredentials(credentials);

      await mockStorageService.clearAll();

      expect(await mockStorageService.getTokens()).toBeNull();
      expect(await mockStorageService.getCredentials()).toBeNull();
    });

    it('should clear tokens independently from credentials', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.clearAll();

      expect(await mockStorageService.getTokens()).toBeNull();
    });

    it('should be safe to clear when empty', async () => {
      // Should not throw error when clearing empty storage
      await mockStorageService.clearAll();

      expect(await mockStorageService.getTokens()).toBeNull();
      expect(await mockStorageService.getCredentials()).toBeNull();
    });

    it('should allow save after clear', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token-1',
        refreshToken: 'refresh-1',
        expiresIn: 3600,
      };

      await mockStorageService.saveTokens(tokens);
      await mockStorageService.clearAll();

      // Should be able to save again
      const newTokens: AuthTokens = {
        accessToken: 'token-2',
        refreshToken: 'refresh-2',
        expiresIn: 7200,
      };

      await mockStorageService.saveTokens(newTokens);
      const retrieved = await mockStorageService.getTokens();

      expect(retrieved).toEqual(newTokens);
    });
  });

  describe('Full auth lifecycle', () => {
    it('should support typical auth flow', async () => {
      // Setup phase
      const credentials: AuthCredentials = {
        apiKey: 'api-key-123',
        baseUrl: 'https://api.example.com',
      };
      const tokens: AuthTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      await mockStorageService.saveCredentials(credentials);
      await mockStorageService.saveTokens(tokens);

      // Verification
      expect(await mockStorageService.getCredentials()).toEqual(credentials);
      expect(await mockStorageService.getTokens()).toEqual(tokens);

      // Token refresh
      await mockStorageService.updateAccessToken('new-access-token');
      const refreshed = await mockStorageService.getTokens();
      expect(refreshed?.accessToken).toBe('new-access-token');

      // Logout
      await mockStorageService.clearAll();
      expect(await mockStorageService.getTokens()).toBeNull();
      expect(await mockStorageService.getCredentials()).toBeNull();
    });

    it('should handle multiple credentials updates', async () => {
      const creds1: AuthCredentials = {
        apiKey: 'key-1',
        baseUrl: 'https://api1.com',
      };

      await mockStorageService.saveCredentials(creds1);
      expect(await mockStorageService.getBaseUrl()).toBe('https://api1.com');

      const creds2: AuthCredentials = {
        apiKey: 'key-2',
        baseUrl: 'https://api2.com',
      };

      await mockStorageService.saveCredentials(creds2);
      expect(await mockStorageService.getBaseUrl()).toBe('https://api2.com');
    });
  });

  describe('IStorageService interface compliance', () => {
    it('should implement all required methods', () => {
      expect(typeof mockStorageService.saveTokens).toBe('function');
      expect(typeof mockStorageService.getTokens).toBe('function');
      expect(typeof mockStorageService.saveCredentials).toBe('function');
      expect(typeof mockStorageService.getCredentials).toBe('function');
      expect(typeof mockStorageService.getBaseUrl).toBe('function');
      expect(typeof mockStorageService.updateAccessToken).toBe('function');
      expect(typeof mockStorageService.clearAll).toBe('function');
    });

    it('should be assignable to IStorageService type', () => {
      const service: typeof mockStorageService = mockStorageService;
      expect(service).toBeDefined();
    });

    it('should return promises from all methods', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      const saveResult = mockStorageService.saveTokens(tokens);
      expect(saveResult).toBeInstanceOf(Promise);

      const getResult = mockStorageService.getTokens();
      expect(getResult).toBeInstanceOf(Promise);

      const updateResult = mockStorageService.updateAccessToken('new-token');
      expect(updateResult).toBeInstanceOf(Promise);

      const clearResult = mockStorageService.clearAll();
      expect(clearResult).toBeInstanceOf(Promise);
    });
  });
});
