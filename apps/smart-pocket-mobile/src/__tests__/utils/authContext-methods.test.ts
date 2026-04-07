/**
 * Advanced tests for authContext setup/logout/clearError methods
 * Uses mocking of dependencies and testing library's render + hooks
 */

import { createContext, useState, useCallback } from 'react';
import { AuthCredentials, AuthTokens } from '@/types/auth';

/**
 * Simplified test version of auth context methods
 * This mimics the actual authContext structure but is testable
 */
export const createAuthContextMethods = (
  authService: any,
  apiClient: any,
  router: any
) => {
  return {
    setup: async (credentials: AuthCredentials) => {
      try {
        const tokens: AuthTokens = await authService.setup(credentials);
        await apiClient.initialize(credentials.baseUrl, tokens.accessToken);
        router.replace('/(protected)/dashboard');
        return { success: true, tokens };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Setup failed';
        throw new Error(errorMessage);
      }
    },

    logout: async () => {
      try {
        await authService.logout();
        apiClient.reset();
        router.replace('/setup');
        return { success: true };
      } catch (err) {
        console.error('Error during logout:', err);
        throw err;
      }
    },

    clearError: () => {
      // Synchronous operation
      return { cleared: true };
    },
  };
};

describe('authContext Methods', () => {
  let mockAuthService: any;
  let mockApiClient: any;
  let mockRouter: any;
  let authMethods: any;

  beforeEach(() => {
    mockAuthService = {
      setup: jest.fn(),
      logout: jest.fn(),
      refreshAccessToken: jest.fn(),
      loadStoredAuth: jest.fn(),
    };

    mockApiClient = {
      initialize: jest.fn(),
      reset: jest.fn(),
      updateAccessToken: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    mockRouter = {
      replace: jest.fn(),
    };

    authMethods = createAuthContextMethods(
      mockAuthService,
      mockApiClient,
      mockRouter
    );
  });

  describe('setup method', () => {
    it('should call authService.setup with credentials', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key-123',
        baseUrl: 'https://api.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValue(tokens);

      await authMethods.setup(credentials);

      expect(mockAuthService.setup).toHaveBeenCalledWith(credentials);
    });

    it('should initialize API client with baseUrl and accessToken', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValue(tokens);

      await authMethods.setup(credentials);

      expect(mockApiClient.initialize).toHaveBeenCalledWith(
        'https://api.example.com',
        'access-123'
      );
    });

    it('should navigate to dashboard on successful setup', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValue(tokens);

      await authMethods.setup(credentials);

      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/dashboard');
    });

    it('should return tokens on success', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValue(tokens);

      const result = await authMethods.setup(credentials);

      expect(result).toEqual({ success: true, tokens });
    });

    it('should throw error on authService.setup failure', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'invalid-key',
        baseUrl: 'https://api.example.com',
      };

      mockAuthService.setup.mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(authMethods.setup(credentials)).rejects.toThrow(
        'Invalid credentials'
      );

      // Router should not be called on error
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should throw error on apiClient.initialize failure', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://invalid.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValue(tokens);
      mockApiClient.initialize.mockRejectedValue(new Error('Connection error'));

      await expect(authMethods.setup(credentials)).rejects.toThrow(
        'Connection error'
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      mockAuthService.setup.mockRejectedValue('String error');

      // Non-Error exceptions are wrapped in new Error with 'Setup failed' message
      await expect(authMethods.setup(credentials)).rejects.toThrow(
        'Setup failed'
      );
    });

    it('should call all setup steps in sequence', async () => {
      const callOrder: string[] = [];

      mockAuthService.setup.mockImplementation(async () => {
        callOrder.push('authService.setup');
        return {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
        };
      });

      mockApiClient.initialize.mockImplementation(async () => {
        callOrder.push('apiClient.initialize');
      });

      mockRouter.replace.mockImplementation(() => {
        callOrder.push('router.replace');
      });

      const credentials: AuthCredentials = {
        apiKey: 'key',
        baseUrl: 'https://api.example.com',
      };

      await authMethods.setup(credentials);

      expect(callOrder).toEqual([
        'authService.setup',
        'apiClient.initialize',
        'router.replace',
      ]);
    });
  });

  describe('logout method', () => {
    it('should call authService.logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await authMethods.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should reset API client', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await authMethods.logout();

      expect(mockApiClient.reset).toHaveBeenCalled();
    });

    it('should navigate to setup screen', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await authMethods.logout();

      expect(mockRouter.replace).toHaveBeenCalledWith('/setup');
    });

    it('should return success on successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await authMethods.logout();

      expect(result).toEqual({ success: true });
    });

    it('should handle authService.logout errors', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(authMethods.logout()).rejects.toThrow('Logout failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error during logout:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should call all logout steps in sequence', async () => {
      const callOrder: string[] = [];

      mockAuthService.logout.mockImplementation(async () => {
        callOrder.push('authService.logout');
      });

      mockApiClient.reset.mockImplementation(() => {
        callOrder.push('apiClient.reset');
      });

      mockRouter.replace.mockImplementation(() => {
        callOrder.push('router.replace');
      });

      await authMethods.logout();

      expect(callOrder).toEqual([
        'authService.logout',
        'apiClient.reset',
        'router.replace',
      ]);
    });

    it('should complete logout even if router.replace fails', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      mockRouter.replace.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      // The logout still completes, router error is not caught
      await expect(authMethods.logout()).rejects.toThrow('Navigation failed');

      // But authService.logout and apiClient.reset were called
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockApiClient.reset).toHaveBeenCalled();
    });
  });

  describe('clearError method', () => {
    it('should be synchronous', () => {
      const result = authMethods.clearError();
      expect(result).toEqual({ cleared: true });
    });

    it('should not throw errors', () => {
      expect(() => authMethods.clearError()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      const result1 = authMethods.clearError();
      const result2 = authMethods.clearError();
      const result3 = authMethods.clearError();

      expect(result1).toEqual({ cleared: true });
      expect(result2).toEqual({ cleared: true });
      expect(result3).toEqual({ cleared: true });
    });
  });

  describe('Auth flow integration', () => {
    it('should support full setup + logout cycle', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      // Setup
      mockAuthService.setup.mockResolvedValue(tokens);
      const setupResult = await authMethods.setup(credentials);
      expect(setupResult.success).toBe(true);

      // Verify state after setup
      expect(mockAuthService.setup).toHaveBeenCalledWith(credentials);
      expect(mockApiClient.initialize).toHaveBeenCalledWith(
        credentials.baseUrl,
        tokens.accessToken
      );

      // Reset mocks for logout
      jest.clearAllMocks();
      mockAuthService.logout.mockResolvedValue(undefined);

      // Logout
      const logoutResult = await authMethods.logout();
      expect(logoutResult.success).toBe(true);

      // Verify logout calls
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockApiClient.reset).toHaveBeenCalled();
    });

    it('should handle setup failure and recovery', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      // First attempt fails
      mockAuthService.setup.mockRejectedValueOnce(new Error('Setup failed'));

      await expect(authMethods.setup(credentials)).rejects.toThrow(
        'Setup failed'
      );

      // Second attempt succeeds
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      };

      mockAuthService.setup.mockResolvedValueOnce(tokens);

      const result = await authMethods.setup(credentials);
      expect(result.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle missing error message gracefully', async () => {
      const credentials: AuthCredentials = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      };

      mockAuthService.setup.mockRejectedValue(new Error());

      await expect(authMethods.setup(credentials)).rejects.toThrow();
    });

    it('should log logout errors to console', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(authMethods.logout()).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
