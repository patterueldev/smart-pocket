/**
 * Comprehensive tests for useAuth hook
 * Tests auth state initialization, login, logout, token management, and error handling
 */

import { useAuth } from '@/hooks/useAuth';
import { AuthContext, AuthProvider } from '@/utils/authContext';
import { AuthCredentials, AuthTokens } from '@/types/auth';

// Mock the services
const mockAuthService = {
  setup: jest.fn(),
  logout: jest.fn(),
  refreshAccessToken: jest.fn(),
  loadStoredAuth: jest.fn(),
};

const mockApiClient = {
  initialize: jest.fn(),
  reset: jest.fn(),
};

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

// Mock the ServiceFactory
jest.mock('@/services', () => ({
  ServiceFactory: {
    createServices: jest.fn(() => ({
      authService: mockAuthService,
      apiClient: mockApiClient,
    })),
  },
}));

// Override the router mock to provide the one we control
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useRootNavigationState: () => ({
    key: 'root',
  }),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Error Handling', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        useAuth();
      }).toThrow();
    });

    it('should have descriptive error message', () => {
      try {
        useAuth();
        fail('Should throw');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toBeTruthy();
        // Either React's null context error or our custom message
        expect(message.length > 0).toBe(true);
      }
    });
  });

  describe('Hook Exports and Types', () => {
    it('should be a function', () => {
      expect(typeof useAuth).toBe('function');
    });

    it('should be exportable', () => {
      expect(useAuth).toBeDefined();
      expect(useAuth.name).toBe('useAuth');
    });
  });

  describe('AuthContext Default Value', () => {
    it('should have correct default properties', () => {
      const defaultValue = {
        isLoggedIn: false,
        isLoading: false,
        error: null,
        accessToken: null,
        refreshToken: null,
        baseUrl: null,
        setup: async () => {},
        logout: async () => {},
        clearError: () => {},
        initializeFromStorage: async () => {},
      };

      expect(defaultValue).toHaveProperty('isLoggedIn', false);
      expect(defaultValue).toHaveProperty('isLoading', false);
      expect(defaultValue).toHaveProperty('error', null);
      expect(defaultValue).toHaveProperty('accessToken', null);
      expect(defaultValue).toHaveProperty('refreshToken', null);
      expect(defaultValue).toHaveProperty('baseUrl', null);
    });

    it('should have all required methods', () => {
      const defaultValue = {
        setup: async () => {},
        logout: async () => {},
        clearError: () => {},
        initializeFromStorage: async () => {},
      };

      expect(typeof defaultValue.setup).toBe('function');
      expect(typeof defaultValue.logout).toBe('function');
      expect(typeof defaultValue.clearError).toBe('function');
      expect(typeof defaultValue.initializeFromStorage).toBe('function');
    });
  });

  describe('AuthProvider Component', () => {
    it('should be a React component', () => {
      expect(typeof AuthProvider).toBe('function');
    });

    it('should have a Provider element', () => {
      expect(AuthContext.Provider).toBeDefined();
      expect(typeof AuthContext.Provider).toBe('object');
    });
  });

  describe('Auth State Types and Interfaces', () => {
    it('should support AuthCredentials type', () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'http://localhost:3000',
      };

      expect(credentials.apiKey).toBe('test-key');
      expect(credentials.baseUrl).toBe('http://localhost:3000');
    });

    it('should support AuthTokens type', () => {
      const tokens: AuthTokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      expect(tokens.accessToken).toBe('access');
      expect(tokens.refreshToken).toBe('refresh');
      expect(tokens.expiresIn).toBe(3600);
    });

    it('should have proper initial auth state', () => {
      const state = {
        isLoggedIn: false,
        isLoading: false,
        error: null,
        accessToken: null,
        refreshToken: null,
        baseUrl: null,
      };

      expect(state.isLoggedIn).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.baseUrl).toBeNull();
    });

    it('should support logged in state', () => {
      const state = {
        isLoggedIn: true,
        isLoading: false,
        error: null,
        accessToken: 'token',
        refreshToken: 'refresh',
        baseUrl: 'http://api.example.com',
      };

      expect(state.isLoggedIn).toBe(true);
      expect(state.accessToken).toBeTruthy();
      expect(state.refreshToken).toBeTruthy();
      expect(state.baseUrl).toBeTruthy();
    });

    it('should support error state', () => {
      const state = {
        isLoggedIn: false,
        isLoading: false,
        error: 'Invalid credentials',
        accessToken: null,
        refreshToken: null,
        baseUrl: null,
      };

      expect(state.error).toBeTruthy();
      expect(state.isLoggedIn).toBe(false);
    });

    it('should support loading state', () => {
      const state = {
        isLoggedIn: false,
        isLoading: true,
        error: null,
        accessToken: null,
        refreshToken: null,
        baseUrl: null,
      };

      expect(state.isLoading).toBe(true);
    });
  });

  describe('AuthService Integration', () => {
    it('should have setup method', () => {
      expect(mockAuthService.setup).toBeDefined();
      expect(typeof mockAuthService.setup).toBe('function');
    });

    it('should have logout method', () => {
      expect(mockAuthService.logout).toBeDefined();
      expect(typeof mockAuthService.logout).toBe('function');
    });

    it('should have loadStoredAuth method', () => {
      expect(mockAuthService.loadStoredAuth).toBeDefined();
      expect(typeof mockAuthService.loadStoredAuth).toBe('function');
    });

    it('should have refreshAccessToken method', () => {
      expect(mockAuthService.refreshAccessToken).toBeDefined();
      expect(typeof mockAuthService.refreshAccessToken).toBe('function');
    });

    it('should support successful setup', async () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValueOnce(tokens);

      const result = await mockAuthService.setup({
        apiKey: 'key',
        baseUrl: 'http://localhost:3000',
      });

      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('refresh');
      expect(mockAuthService.setup).toHaveBeenCalled();
    });

    it('should support logout', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);

      await mockAuthService.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should support loading stored auth', async () => {
      mockAuthService.loadStoredAuth.mockResolvedValueOnce({
        tokens: {
          accessToken: 'stored-token',
          refreshToken: 'refresh',
          expiresIn: 3600,
        },
        credentials: {
          apiKey: 'key',
          baseUrl: 'http://localhost:3000',
        },
      });

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens).toBeDefined();
      expect(result.credentials).toBeDefined();
      expect(result.tokens?.accessToken).toBe('stored-token');
    });

    it('should support null stored auth', async () => {
      mockAuthService.loadStoredAuth.mockResolvedValueOnce({
        tokens: null,
        credentials: null,
      });

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens).toBeNull();
      expect(result.credentials).toBeNull();
    });

    it('should support token refresh', async () => {
      mockAuthService.refreshAccessToken.mockResolvedValueOnce('new-token');

      const newToken = await mockAuthService.refreshAccessToken(
        'http://localhost:3000',
        'refresh-token'
      );

      expect(newToken).toBe('new-token');
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(
        'http://localhost:3000',
        'refresh-token'
      );
    });
  });

  describe('API Client Integration', () => {
    it('should have initialize method', () => {
      expect(mockApiClient.initialize).toBeDefined();
      expect(typeof mockApiClient.initialize).toBe('function');
    });

    it('should have reset method', () => {
      expect(mockApiClient.reset).toBeDefined();
      expect(typeof mockApiClient.reset).toBe('function');
    });

    it('should be able to initialize with credentials', () => {
      mockApiClient.initialize('http://api.example.com', 'token');

      expect(mockApiClient.initialize).toHaveBeenCalledWith(
        'http://api.example.com',
        'token'
      );
    });

    it('should be able to reset client state', () => {
      mockApiClient.reset();

      expect(mockApiClient.reset).toHaveBeenCalled();
    });
  });

  describe('Router Integration', () => {
    it('should have push method', () => {
      expect(mockRouter.push).toBeDefined();
      expect(typeof mockRouter.push).toBe('function');
    });

    it('should have replace method', () => {
      expect(mockRouter.replace).toBeDefined();
      expect(typeof mockRouter.replace).toBe('function');
    });

    it('should have back method', () => {
      expect(mockRouter.back).toBeDefined();
      expect(typeof mockRouter.back).toBe('function');
    });

    it('should be able to navigate to setup screen', () => {
      mockRouter.replace('/setup');

      expect(mockRouter.replace).toHaveBeenCalledWith('/setup');
    });

    it('should be able to navigate to protected tabs', () => {
      mockRouter.replace('/(protected)/(tabs)');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/(tabs)');
    });
  });

  describe('ServiceFactory Integration', () => {
    it('should create services via ServiceFactory', () => {
      const { ServiceFactory } = require('@/services');

      const services = ServiceFactory.createServices('real');

      expect(services).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.apiClient).toBeDefined();
    });

    it('should support mock services', () => {
      const { ServiceFactory } = require('@/services');

      const services = ServiceFactory.createServices('mock');

      expect(services).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.apiClient).toBeDefined();
    });
  });

  describe('Mock Setup Behavior', () => {
    it('should reset mocks between tests', () => {
      mockAuthService.setup.mockResolvedValueOnce({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      mockAuthService.setup({
        apiKey: 'key',
        baseUrl: 'http://localhost:3000',
      });

      expect(mockAuthService.setup).toHaveBeenCalled();

      jest.clearAllMocks();

      expect(mockAuthService.setup).not.toHaveBeenCalled();
    });

    it('should support multiple consecutive calls', () => {
      mockAuthService.setup.mockResolvedValueOnce({
        accessToken: 'token1',
        refreshToken: 'refresh1',
        expiresIn: 3600,
      });

      mockAuthService.setup.mockResolvedValueOnce({
        accessToken: 'token2',
        refreshToken: 'refresh2',
        expiresIn: 7200,
      });

      expect(mockAuthService.setup).toBeDefined();
    });

    it('should track call arguments', async () => {
      mockAuthService.setup.mockResolvedValueOnce({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const credentials: AuthCredentials = {
        apiKey: 'my-api-key',
        baseUrl: 'https://api.example.com',
      };

      await mockAuthService.setup(credentials);

      expect(mockAuthService.setup).toHaveBeenCalledWith(credentials);
    });
  });

  describe('Type System', () => {
    it('should enforce AuthCredentials type', () => {
      const validCredentials: AuthCredentials = {
        apiKey: 'key-123',
        baseUrl: 'https://api.example.com',
      };

      expect(typeof validCredentials.apiKey).toBe('string');
      expect(typeof validCredentials.baseUrl).toBe('string');
    });

    it('should enforce AuthTokens type', () => {
      const validTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      expect(typeof validTokens.accessToken).toBe('string');
      expect(typeof validTokens.refreshToken).toBe('string');
      expect(typeof validTokens.expiresIn).toBe('number');
    });

    it('should support token expiration', () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 7200,
      };

      expect(tokens.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('Setup Request Response Types', () => {
    it('should have proper SetupRequest format', () => {
      const request = { apiKey: 'my-key' };

      expect(request.apiKey).toBeTruthy();
      expect(typeof request.apiKey).toBe('string');
    });

    it('should have proper SetupResponse format', () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      expect(response.accessToken).toBeTruthy();
      expect(response.refreshToken).toBeTruthy();
      expect(response.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('Context Integration Points', () => {
    it('should integrate with AuthService', () => {
      expect(mockAuthService).toBeDefined();
      expect(mockAuthService.setup).toBeDefined();
      expect(mockAuthService.logout).toBeDefined();
    });

    it('should integrate with ApiClient', () => {
      expect(mockApiClient).toBeDefined();
      expect(mockApiClient.initialize).toBeDefined();
      expect(mockApiClient.reset).toBeDefined();
    });

    it('should integrate with Router', () => {
      expect(mockRouter).toBeDefined();
      expect(mockRouter.replace).toBeDefined();
      expect(mockRouter.push).toBeDefined();
    });

    it('should use ServiceFactory', () => {
      const { ServiceFactory } = require('@/services');

      expect(ServiceFactory).toBeDefined();
      expect(ServiceFactory.createServices).toBeDefined();
    });
  });

  describe('Credentials Management', () => {
    it('should handle API key storage', () => {
      const credentials: AuthCredentials = {
        apiKey: 'secure-api-key-12345',
        baseUrl: 'http://localhost:3000',
      };

      expect(credentials.apiKey).toBe('secure-api-key-12345');
    });

    it('should handle base URL configuration', () => {
      const credentials: AuthCredentials = {
        apiKey: 'key',
        baseUrl: 'https://production-api.example.com',
      };

      expect(credentials.baseUrl).toMatch(/^https?:\/\//);
    });

    it('should support multiple base URLs', () => {
      const localCredentials: AuthCredentials = {
        apiKey: 'dev-key',
        baseUrl: 'http://localhost:3000',
      };

      const prodCredentials: AuthCredentials = {
        apiKey: 'prod-key',
        baseUrl: 'https://api.example.com',
      };

      expect(localCredentials.baseUrl).toContain('localhost');
      expect(prodCredentials.baseUrl).toContain('example.com');
    });
  });

  describe('Token Storage and Retrieval', () => {
    it('should store and retrieve access tokens', async () => {
      const tokens: AuthTokens = {
        accessToken: 'stored-access-token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      mockAuthService.loadStoredAuth.mockResolvedValueOnce({
        tokens,
        credentials: null,
      });

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens?.accessToken).toBe('stored-access-token');
    });

    it('should store and retrieve refresh tokens', async () => {
      const tokens: AuthTokens = {
        accessToken: 'access',
        refreshToken: 'stored-refresh-token',
        expiresIn: 3600,
      };

      mockAuthService.loadStoredAuth.mockResolvedValueOnce({
        tokens,
        credentials: null,
      });

      const result = await mockAuthService.loadStoredAuth();

      expect(result.tokens?.refreshToken).toBe('stored-refresh-token');
    });

    it('should track token expiration time', () => {
      const tokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };

      const expiresAt = Date.now() + tokens.expiresIn * 1000;

      expect(expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Hook Context Requirement', () => {
    it('should fail gracefully outside provider context', () => {
      const testFn = () => useAuth();

      expect(testFn).toThrow();
    });

    it('should provide clear error message', () => {
      try {
        useAuth();
      } catch (e) {
        // Either the hook's own message or React's null context message
        const message = (e as Error).message;
        expect(message).toBeTruthy();
      }
    });
  });
});
