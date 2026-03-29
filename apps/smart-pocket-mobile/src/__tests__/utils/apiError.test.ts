import { AxiosError } from 'axios';
import { handleApiError, ApiError } from '../../utils/apiError';

jest.mock('axios', () => ({
  isAxiosError: jest.fn((error) => {
    return error && typeof error === 'object' && (error as any).isAxiosError === true;
  }),
}));

describe('apiError Utilities', () => {
  describe('handleApiError', () => {
    it('should handle session expired error', () => {
      const error: Partial<AxiosError> = {
        message: 'Session expired. Please log in again.',
        isAxiosError: true,
      };

      const result = handleApiError(error);

      expect(result.message).toBe('Session expired. Please log in again.');
      expect(result.code).toBe('SESSION_EXPIRED');
      expect(result.status).toBe(401);
    });

    it('should handle connection timeout error', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      const result = handleApiError(error);

      expect(result.code).toBe('TIMEOUT');
      expect(result.message).toContain('Connection timeout');
    });

    it('should handle connection not found error', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com',
      };

      const result = handleApiError(error);

      expect(result.code).toBe('UNREACHABLE');
      expect(result.message).toContain('Unable to reach the server');
    });

    it('should handle connection refused error', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:3000',
      };

      const result = handleApiError(error);

      expect(result.code).toBe('UNREACHABLE');
      expect(result.message).toContain('Unable to reach the server');
    });

    it('should handle 401 Unauthorized response', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Unauthorized',
        response: { status: 401 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(401);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.message).toContain('Unauthorized');
    });

    it('should handle 403 Forbidden response', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Forbidden',
        response: { status: 403 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(403);
      expect(result.code).toBe('FORBIDDEN');
      expect(result.message).toContain('Access denied');
    });

    it('should handle 404 Not Found response', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Not Found',
        response: { status: 404 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(404);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('should handle 500 Server Error response', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Internal Server Error',
        response: { status: 500 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(500);
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should handle generic server error (5xx)', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Bad Gateway',
        response: { status: 502 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(502);
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should handle validation error (400)', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Bad Request',
        response: { status: 400 } as any,
      };

      const result = handleApiError(error);

      expect(result.status).toBe(400);
      expect(result.code).toBe('AXIOS_ERROR');
    });

    it('should handle non-axios Error objects', () => {
      const error = new Error('Generic error');

      const result = handleApiError(error);

      expect(result.message).toBe('Generic error');
      expect(result.code).toBe('ERROR');
    });

    it('should handle string error messages', () => {
      const error = 'Something went wrong';

      const result = handleApiError(error);

      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('UNKNOWN');
    });

    it('should handle null/undefined errors', () => {
      const result1 = handleApiError(null);
      const result2 = handleApiError(undefined);

      expect(result1.message).toBe('An unexpected error occurred');
      expect(result2.message).toBe('An unexpected error occurred');
      expect(result1.code).toBe('UNKNOWN');
      expect(result2.code).toBe('UNKNOWN');
    });

    it('should provide fallback message for axios error without response', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Request failed',
        response: undefined,
        code: 'UNKNOWN',
      };

      const result = handleApiError(error);

      expect(result.code).toBe('AXIOS_ERROR');
      expect(result.message).toBeDefined();
    });

    it('should preserve original error message when possible', () => {
      const error: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Custom error message',
        response: { status: 400 } as any,
      };

      const result = handleApiError(error);

      expect(result.message).toContain('Custom error message');
    });
  });

  describe('ApiError Interface', () => {
    it('should create ApiError with required message', () => {
      const error: ApiError = {
        message: 'Test error',
      };

      expect(error.message).toBeDefined();
      expect(typeof error.message).toBe('string');
    });

    it('should create ApiError with optional code and status', () => {
      const error: ApiError = {
        message: 'Test error',
        code: 'TEST_ERROR',
        status: 400,
      };

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
    });
  });
});
