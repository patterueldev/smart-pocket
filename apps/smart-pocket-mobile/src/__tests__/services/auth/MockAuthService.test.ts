import { MockAuthService } from '../../../services/auth/MockAuthService';
import { IStorageService } from '../../../services/storage/IStorageService';
import { AuthCredentials, AuthTokens } from '@/types/auth';

describe('MockAuthService', () => {
  let mockAuthService: MockAuthService;
  let mockStorageService: jest.Mocked<IStorageService>;

  beforeEach(() => {
    mockStorageService = {
      saveTokens: jest.fn().mockResolvedValue(undefined),
      saveCredentials: jest.fn().mockResolvedValue(undefined),
      getTokens: jest.fn().mockResolvedValue(null),
      getCredentials: jest.fn().mockResolvedValue(null),
      updateAccessToken: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IStorageService>;

    mockAuthService = new MockAuthService(mockStorageService);
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setup', () => {
    it('should generate and save tokens for valid credentials', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key-12345',
        baseUrl: 'https://api.example.com',
      };

      const result = await mockAuthService.setup(credentials);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 3600);
      expect(result.accessToken).toMatch(/^mock_access_\d+$/);
      expect(result.refreshToken).toMatch(/^mock_refresh_\d+$/);
    });

    it('should save tokens and credentials to storage', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key-12345',
        baseUrl: 'https://api.example.com',
      };

      await mockAuthService.setup(credentials);

      expect(mockStorageService.saveTokens).toHaveBeenCalled();
      expect(mockStorageService.saveCredentials).toHaveBeenCalledWith(credentials);
    });

    it('should throw error for empty API key', async () => {
      const credentials: AuthCredentials = {
        apiKey: '',
        baseUrl: 'https://api.example.com',
      };

      await expect(mockAuthService.setup(credentials)).rejects.toThrow(
        'API key cannot be empty'
      );
    });

    it('should throw error for whitespace-only API key', async () => {
      const credentials: AuthCredentials = {
        apiKey: '   ',
        baseUrl: 'https://api.example.com',
      };

      await expect(mockAuthService.setup(credentials)).rejects.toThrow(
        'API key cannot be empty'
      );
    });

    it('should throw error for missing base URL', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key',
        baseUrl: '',
      };

      await expect(mockAuthService.setup(credentials)).rejects.toThrow(
        'Invalid base URL'
      );
    });

    it('should log setup information', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key-12345',
        baseUrl: 'https://api.example.com',
      };

      await mockAuthService.setup(credentials);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[MockAuthService] Setup successful'),
        expect.any(Object)
      );
    });

    it('should simulate API delay (async operation)', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-api-key-12345',
        baseUrl: 'https://api.example.com',
      };

      const startTime = Date.now();
      await mockAuthService.setup(credentials);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(500);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token', async () => {
      const result = await mockAuthService.refreshAccessToken(
        'https://api.example.com',
        'refresh-token-123'
      );

      expect(result).toMatch(/^mock_access_\d+$/);
    });

    it('should update stored access token', async () => {
      const baseUrl = 'https://api.example.com';
      const refreshToken = 'refresh-token-123';

      await mockAuthService.refreshAccessToken(baseUrl, refreshToken);

      expect(mockStorageService.updateAccessToken).toHaveBeenCalled();
    });

    it('should log token refresh', async () => {
      await mockAuthService.refreshAccessToken(
        'https://api.example.com',
        'refresh-token-123'
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[MockAuthService] Token refreshed')
      );
    });

    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await mockAuthService.refreshAccessToken(
        'https://api.example.com',
        'refresh-token-123'
      );
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(300);
    });
  });

  describe('logout', () => {
    it('should clear all stored data', async () => {
      await mockAuthService.logout();

      expect(mockStorageService.clearAll).toHaveBeenCalled();
    });

    it('should log logout action', async () => {
      await mockAuthService.logout();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[MockAuthService] Logged out')
      );
    });
  });

  describe('loadStoredAuth', () => {
    it('should load tokens and credentials from storage', async () => {
      const tokens: AuthTokens = {
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
        expiresIn: 3600,
      };
      const credentials: AuthCredentials = {
        apiKey: 'stored-api-key',
        baseUrl: 'https://api.example.com',
      };

      mockStorageService.getTokens.mockResolvedValue(tokens);
      mockStorageService.getCredentials.mockResolvedValue(credentials);

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens).toEqual(tokens);
      expect(result.credentials).toEqual(credentials);
    });

    it('should return null for tokens and credentials if not stored', async () => {
      mockStorageService.getTokens.mockResolvedValue(null);
      mockStorageService.getCredentials.mockResolvedValue(null);

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens).toBeNull();
      expect(result.credentials).toBeNull();
    });

    it('should call storage methods in parallel', async () => {
      await mockAuthService.loadStoredAuth();

      expect(mockStorageService.getTokens).toHaveBeenCalled();
      expect(mockStorageService.getCredentials).toHaveBeenCalled();
    });

    it('should log loaded auth information', async () => {
      await mockAuthService.loadStoredAuth();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[MockAuthService] Loaded stored auth'),
        expect.objectContaining({
          hasTokens: expect.any(Boolean),
          hasCredentials: expect.any(Boolean),
        })
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageService.getTokens.mockRejectedValue(new Error('Storage error'));

      await expect(mockAuthService.loadStoredAuth()).rejects.toThrow('Storage error');
    });
  });

  describe('IAuthService interface compliance', () => {
    it('should implement all required methods', () => {
      expect(typeof mockAuthService.setup).toBe('function');
      expect(typeof mockAuthService.refreshAccessToken).toBe('function');
      expect(typeof mockAuthService.logout).toBe('function');
      expect(typeof mockAuthService.loadStoredAuth).toBe('function');
    });

    it('should match IAuthService contract', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      // All methods should be callable and return promises
      const setupPromise = mockAuthService.setup(credentials);
      expect(setupPromise).toBeInstanceOf(Promise);

      const result = await setupPromise;
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });
  });
});
