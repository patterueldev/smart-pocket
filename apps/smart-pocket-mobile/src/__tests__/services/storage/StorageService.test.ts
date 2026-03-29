import * as SecureStore from 'expo-secure-store';
import { StorageService } from '../../../services/storage/StorageService';
import { AuthTokens, AuthCredentials } from '../../../types/auth';

jest.mock('expo-secure-store');

describe('StorageService', () => {
  let service: StorageService;
  const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StorageService();
    // Default successful responses
    mockSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  describe('saveTokens', () => {
    it('should save tokens to secure storage', async () => {
      const tokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      };

      await service.saveTokens(tokens);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_accessToken',
        'access-token-123'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_refreshToken',
        'refresh-token-456'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_expiresIn',
        '3600'
      );
    });

    it('should convert expiresIn number to string', async () => {
      const tokens: AuthTokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 1800,
      };

      await service.saveTokens(tokens);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_expiresIn',
        '1800'
      );
    });

    it('should throw error when SecureStore fails', async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      const tokens: AuthTokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      await expect(service.saveTokens(tokens)).rejects.toThrow(
        'Failed to save authentication tokens'
      );
    });
  });

  describe('getTokens', () => {
    it('should retrieve tokens from secure storage', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('access-token-123')
        .mockResolvedValueOnce('refresh-token-456')
        .mockResolvedValueOnce('3600');

      const tokens = await service.getTokens();

      expect(tokens).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      });
    });

    it('should return null when access token is missing', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce('3600');

      const tokens = await service.getTokens();

      expect(tokens).toBeNull();
    });

    it('should return null when refresh token is missing', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('3600');

      const tokens = await service.getTokens();

      expect(tokens).toBeNull();
    });

    it('should return null when expiresIn is missing', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce(null);

      const tokens = await service.getTokens();

      expect(tokens).toBeNull();
    });

    it('should parse expiresIn as integer', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh')
        .mockResolvedValueOnce('7200');

      const tokens = await service.getTokens();

      expect(tokens?.expiresIn).toBe(7200);
      expect(typeof tokens?.expiresIn).toBe('number');
    });

    it('should return null on SecureStore error', async () => {
      mockSecureStore.getItemAsync.mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      const tokens = await service.getTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('saveCredentials', () => {
    it('should save credentials to secure storage', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'api-key-12345',
        baseUrl: 'http://localhost:3000',
      };

      await service.saveCredentials(credentials);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_apiKey',
        'api-key-12345'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_baseUrl',
        'http://localhost:3000'
      );
    });

    it('should throw error when SecureStore fails', async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      const credentials: AuthCredentials = {
        apiKey: 'api-key',
        baseUrl: 'http://localhost:3000',
      };

      await expect(service.saveCredentials(credentials)).rejects.toThrow(
        'Failed to save credentials'
      );
    });
  });

  describe('getCredentials', () => {
    it('should retrieve credentials from secure storage', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('api-key-12345')
        .mockResolvedValueOnce('http://localhost:3000');

      const credentials = await service.getCredentials();

      expect(credentials).toEqual({
        apiKey: 'api-key-12345',
        baseUrl: 'http://localhost:3000',
      });
    });

    it('should return null when API key is missing', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('http://localhost:3000');

      const credentials = await service.getCredentials();

      expect(credentials).toBeNull();
    });

    it('should return null when base URL is missing', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('api-key')
        .mockResolvedValueOnce(null);

      const credentials = await service.getCredentials();

      expect(credentials).toBeNull();
    });

    it('should return null on SecureStore error', async () => {
      mockSecureStore.getItemAsync.mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      const credentials = await service.getCredentials();

      expect(credentials).toBeNull();
    });
  });

  describe('getBaseUrl', () => {
    it('should retrieve base URL from storage', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(
        'http://localhost:3000'
      );

      const baseUrl = await service.getBaseUrl();

      expect(baseUrl).toBe('http://localhost:3000');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('auth_baseUrl');
    });

    it('should return null when base URL is not found', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      const baseUrl = await service.getBaseUrl();

      expect(baseUrl).toBeNull();
    });

    it('should return null on error', async () => {
      mockSecureStore.getItemAsync.mockRejectedValueOnce(
        new Error('Storage error')
      );

      const baseUrl = await service.getBaseUrl();

      expect(baseUrl).toBeNull();
    });
  });

  describe('updateAccessToken', () => {
    it('should update the access token', async () => {
      await service.updateAccessToken('new-access-token');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_accessToken',
        'new-access-token'
      );
    });

    it('should throw error when update fails', async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error('Update failed')
      );

      await expect(service.updateAccessToken('token')).rejects.toThrow(
        'Failed to update access token'
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all authentication data', async () => {
      await service.clearAll();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'auth_accessToken'
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'auth_refreshToken'
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'auth_expiresIn'
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'auth_apiKey'
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'auth_baseUrl'
      );
    });

    it('should call deleteItemAsync five times', async () => {
      await service.clearAll();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(5);
    });

    it('should throw error when delete fails', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      await expect(service.clearAll()).rejects.toThrow(
        'Failed to clear authentication data'
      );
    });
  });
});
