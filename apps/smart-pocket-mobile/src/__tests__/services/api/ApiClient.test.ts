import axios from 'axios';
import { ApiClient } from '../../../services/api/ApiClient';
import { IAuthService } from '../../../services/auth/IAuthService';
import { IStorageService } from '../../../services/storage/IStorageService';

jest.mock('axios');

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockStorageService: jest.Mocked<IStorageService>;
  const mockAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthService = {
      setup: jest.fn(),
      refreshAccessToken: jest.fn(),
      logout: jest.fn(),
    } as any;

    mockStorageService = {
      saveTokens: jest.fn(),
      getTokens: jest.fn(),
      saveCredentials: jest.fn(),
      getCredentials: jest.fn(),
      getBaseUrl: jest.fn(),
      updateAccessToken: jest.fn(),
      clearAll: jest.fn(),
    } as any;

    apiClient = new ApiClient(mockAuthService, mockStorageService);

    // Mock axios.create
    mockAxios.create.mockReturnValue({
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: jest.fn((success, error) => {}) },
        response: { use: jest.fn((success, error) => {}) },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any);
  });

  describe('initialize', () => {
    it('should initialize with baseUrl', async () => {
      await apiClient.initialize('http://localhost:3000');

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 30000,
      });
    });

    it('should set auth header when accessToken is provided', async () => {
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any;

      mockAxios.create.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000', 'test-token');

      expect(instance.defaults.headers.common.Authorization).toBe(
        'Bearer test-token'
      );
    });

    it('should setup request interceptor', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      mockCreate.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000');

      expect(instance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should setup response interceptor', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      mockCreate.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000');

      expect(instance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('updateAccessToken', () => {
    it('should update authorization header', async () => {
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any;

      mockAxios.create.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000');
      apiClient.updateAccessToken('new-token');

      expect(instance.defaults.headers.common.Authorization).toBe(
        'Bearer new-token'
      );
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(async () => {
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      } as any;

      mockAxios.create.mockReturnValue(instance);
      await apiClient.initialize('http://localhost:3000');
    });

    it('should throw error when not initialized', async () => {
      const newClient = new ApiClient(mockAuthService, mockStorageService);

      await expect(newClient.get('/test')).rejects.toThrow(
        'ApiClient not initialized'
      );
    });

    it('should get data with GET request', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = mockCreate.mock.results[0].value;
      instance.get.mockResolvedValue({ data: { id: 1, name: 'Test' } });

      const result = await apiClient.get('/users');

      expect(instance.get).toHaveBeenCalledWith('/users', undefined);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should post data with POST request', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = mockCreate.mock.results[0].value;
      instance.post.mockResolvedValue({ data: { id: 1, success: true } });

      const payload = { name: 'New Item' };
      const result = await apiClient.post('/users', payload);

      expect(instance.post).toHaveBeenCalledWith('/users', payload, undefined);
      expect(result).toEqual({ id: 1, success: true });
    });

    it('should put data with PUT request', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = mockCreate.mock.results[0].value;
      instance.put.mockResolvedValue({ data: { id: 1, updated: true } });

      const payload = { name: 'Updated Item' };
      const result = await apiClient.put('/users/1', payload);

      expect(instance.put).toHaveBeenCalledWith('/users/1', payload, undefined);
      expect(result).toEqual({ id: 1, updated: true });
    });

    it('should delete with DELETE request', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = mockCreate.mock.results[0].value;
      instance.delete.mockResolvedValue({ data: { success: true } });

      const result = await apiClient.delete('/users/1');

      expect(instance.delete).toHaveBeenCalledWith('/users/1', undefined);
      expect(result).toEqual({ success: true });
    });

    it('should pass config to GET request', async () => {
      const mockCreate = mockAxios.create as jest.Mock;
      const instance = mockCreate.mock.results[0].value;
      instance.get.mockResolvedValue({ data: [] });

      const config = { headers: { 'X-Custom': 'header' } };
      await apiClient.get('/users', config);

      expect(instance.get).toHaveBeenCalledWith('/users', config);
    });
  });

  describe('reset', () => {
    it('should clear authorization header', async () => {
      const instance = {
        defaults: { headers: { common: { Authorization: 'Bearer token' } } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any;

      mockAxios.create.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000', 'token');
      apiClient.reset();

      expect(instance.defaults.headers.common.Authorization).toBe('');
    });

    it('should clear baseUrl', async () => {
      const instance = {
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any;

      mockAxios.create.mockReturnValue(instance);

      await apiClient.initialize('http://localhost:3000');
      apiClient.reset();

      // Verify by trying to make a request - should fail because not initialized
      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });
});
