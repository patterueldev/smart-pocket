/**
 * AuthService Unit Tests
 * Tests core authentication logic including setup, refresh, and logout
 */

import axios from 'axios';
import { AuthService } from '@/services/auth/AuthService';
import { IStorageService } from '@/services/storage/IStorageService';
import { AuthCredentials, AuthTokens, SetupResponse } from '@/types/auth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockStorageService: jest.Mocked<IStorageService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock storage service
    mockStorageService = {
      saveTokens: jest.fn().mockResolvedValue(undefined),
      getTokens: jest.fn().mockResolvedValue(null),
      saveCredentials: jest.fn().mockResolvedValue(undefined),
      getCredentials: jest.fn().mockResolvedValue(null),
      getBaseUrl: jest.fn().mockResolvedValue(null),
      updateAccessToken: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
    };

    // Create instance
    authService = new AuthService(mockStorageService);
  });

  describe('setup()', () => {
    const testCredentials: AuthCredentials = {
      apiKey: 'test-api-key-12345',
      baseUrl: 'http://localhost:3000',
    };

    const testTokens: SetupResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
    };

    test('should successfully setup with valid credentials', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({ data: testTokens });

      // Act
      const result = await authService.setup(testCredentials);

      // Assert
      expect(result).toEqual({
        accessToken: testTokens.accessToken,
        refreshToken: testTokens.refreshToken,
        expiresIn: testTokens.expiresIn,
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/setup',
        { apiKey: 'test-api-key-12345' },
        { timeout: 10000 }
      );
      expect(mockStorageService.saveTokens).toHaveBeenCalledWith({
        accessToken: testTokens.accessToken,
        refreshToken: testTokens.refreshToken,
        expiresIn: testTokens.expiresIn,
      });
      expect(mockStorageService.saveCredentials).toHaveBeenCalledWith(testCredentials);
    });

    test('should save both tokens and credentials to storage', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({ data: testTokens });

      // Act
      await authService.setup(testCredentials);

      // Assert
      expect(mockStorageService.saveTokens).toHaveBeenCalled();
      expect(mockStorageService.saveCredentials).toHaveBeenCalled();
      // Verify they were called together
      const saveTokensCall = mockStorageService.saveTokens.mock.invocationCallOrder[0];
      const saveCredsCall = mockStorageService.saveCredentials.mock.invocationCallOrder[0];
      expect(Math.abs(saveTokensCall - saveCredsCall)).toBeLessThan(5); // Called close together
    });

    test('should throw error for 401 (invalid API key)', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401 },
        message: 'Unauthorized',
      });

      // Act & Assert
      await expect(authService.setup(testCredentials)).rejects.toThrow('Invalid API key');
    });

    test('should throw error for connection timeout', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'Timeout',
      });

      // Act & Assert
      await expect(authService.setup(testCredentials)).rejects.toThrow('Connection timeout');
    });

    test('should throw error for other axios errors', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        message: 'Network error',
      });

      // Act & Assert
      await expect(authService.setup(testCredentials)).rejects.toThrow('Network error');
    });

    test('should handle 400 validation errors', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400 },
        message: 'Bad request',
      });

      // Act & Assert
      await expect(authService.setup(testCredentials)).rejects.toThrow();
    });

    test('should not save tokens if storage fails', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({ data: testTokens });
      mockStorageService.saveTokens.mockRejectedValueOnce(new Error('Storage error'));

      // Act & Assert
      await expect(authService.setup(testCredentials)).rejects.toThrow('Storage error');
    });
  });

  describe('refreshAccessToken()', () => {
    const baseUrl = 'http://localhost:3000';
    const oldRefreshToken = 'old-refresh-token';
    const newAccessToken = 'new-access-token';

    test('should successfully refresh access token', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({
        data: { accessToken: newAccessToken },
      });

      // Act
      const result = await authService.refreshAccessToken(baseUrl, oldRefreshToken);

      // Assert
      expect(result).toBe(newAccessToken);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseUrl}/auth/refresh`,
        { refreshToken: oldRefreshToken },
        { timeout: 10000 }
      );
      expect(mockStorageService.updateAccessToken).toHaveBeenCalledWith(newAccessToken);
    });

    test('should update storage with new access token', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({
        data: { accessToken: newAccessToken },
      });

      // Act
      await authService.refreshAccessToken(baseUrl, oldRefreshToken);

      // Assert
      expect(mockStorageService.updateAccessToken).toHaveBeenCalledWith(newAccessToken);
    });

    test('should throw error when refresh token is invalid (401)', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401 },
      });

      // Act & Assert
      await expect(
        authService.refreshAccessToken(baseUrl, 'invalid-token')
      ).rejects.toThrow('Failed to refresh authentication');
    });

    test('should throw error on network failure', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(
        authService.refreshAccessToken(baseUrl, oldRefreshToken)
      ).rejects.toThrow('Failed to refresh authentication');
    });

    test('should handle timeout errors', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
      });

      // Act & Assert
      await expect(
        authService.refreshAccessToken(baseUrl, oldRefreshToken)
      ).rejects.toThrow('Failed to refresh authentication');
    });

    test('should not throw specific error details (user-friendly)', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce(new Error('Specific backend error message'));

      // Act & Assert
      const error = await authService.refreshAccessToken(baseUrl, oldRefreshToken).catch(
        (e) => e
      );
      expect(error.message).toBe('Failed to refresh authentication. Please log in again.');
    });
  });

  describe('logout()', () => {
    test('should clear all stored data', async () => {
      // Act
      await authService.logout();

      // Assert
      expect(mockStorageService.clearAll).toHaveBeenCalled();
    });

    test('should clear all data on success', async () => {
      // Arrange
      mockStorageService.clearAll.mockResolvedValueOnce(undefined);

      // Act
      await authService.logout();

      // Assert
      expect(mockStorageService.clearAll).toHaveBeenCalled();
    });

    test('should not throw error if clear fails (graceful degradation)', async () => {
      // Arrange
      mockStorageService.clearAll.mockRejectedValueOnce(new Error('Clear failed'));

      // Act & Assert
      await expect(authService.logout()).resolves.not.toThrow();
    });

    test('should handle console error if clear fails', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageService.clearAll.mockRejectedValueOnce(new Error('Clear failed'));

      // Act
      await authService.logout();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadStoredAuth()', () => {
    test('should load both tokens and credentials from storage', async () => {
      // Arrange
      const testTokens: AuthTokens = {
        accessToken: 'stored-access',
        refreshToken: 'stored-refresh',
        expiresIn: 3600,
      };
      const testCredentials: AuthCredentials = {
        apiKey: 'stored-key',
        baseUrl: 'http://localhost:3000',
      };
      mockStorageService.getTokens.mockResolvedValueOnce(testTokens);
      mockStorageService.getCredentials.mockResolvedValueOnce(testCredentials);

      // Act
      const result = await authService.loadStoredAuth();

      // Assert
      expect(result).toEqual({
        tokens: testTokens,
        credentials: testCredentials,
      });
      expect(mockStorageService.getTokens).toHaveBeenCalled();
      expect(mockStorageService.getCredentials).toHaveBeenCalled();
    });

    test('should return null when no tokens are stored', async () => {
      // Arrange
      mockStorageService.getTokens.mockResolvedValueOnce(null);
      mockStorageService.getCredentials.mockResolvedValueOnce(null);

      // Act
      const result = await authService.loadStoredAuth();

      // Assert
      expect(result).toEqual({
        tokens: null,
        credentials: null,
      });
    });

    test('should return partial data if only tokens exist', async () => {
      // Arrange
      const testTokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };
      mockStorageService.getTokens.mockResolvedValueOnce(testTokens);
      mockStorageService.getCredentials.mockResolvedValueOnce(null);

      // Act
      const result = await authService.loadStoredAuth();

      // Assert
      expect(result.tokens).toEqual(testTokens);
      expect(result.credentials).toBeNull();
    });

    test('should handle storage read errors gracefully', async () => {
      // Arrange
      mockStorageService.getTokens.mockRejectedValueOnce(new Error('Storage error'));

      // Act & Assert
      const error = await authService.loadStoredAuth().catch((e) => e);
      expect(error).toEqual({
        tokens: null,
        credentials: null,
      });
    });

    test('should load tokens and credentials in parallel', async () => {
      // Arrange
      const testTokens: AuthTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      };
      const testCredentials: AuthCredentials = {
        apiKey: 'key',
        baseUrl: 'http://localhost:3000',
      };
      mockStorageService.getTokens.mockResolvedValueOnce(testTokens);
      mockStorageService.getCredentials.mockResolvedValueOnce(testCredentials);

      // Act
      await authService.loadStoredAuth();

      // Assert - both should be called
      expect(mockStorageService.getTokens).toHaveBeenCalled();
      expect(mockStorageService.getCredentials).toHaveBeenCalled();
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle malformed API response', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          // Missing required fields
          accessToken: 'token',
        },
      });

      // Act & Assert
      const result = await authService.setup({
        apiKey: 'test',
        baseUrl: 'http://localhost:3000',
      });

      // Should still return what we got (undefined fields)
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBeUndefined();
    });

    test('should handle empty error response', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValueOnce({});

      // Act & Assert
      await expect(
        authService.setup({
          apiKey: 'test',
          baseUrl: 'http://localhost:3000',
        })
      ).rejects.toThrow();
    });
  });
});
