/**
 * API error helper utilities.
 * Provides consistent error handling and user-friendly messages.
 */

import { isAxiosError, AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Convert an error to a user-friendly API error object.
 */
export function handleApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Session expired error
    if (axiosError.message === 'Session expired. Please log in again.') {
      return {
        message: axiosError.message,
        code: 'SESSION_EXPIRED',
        status: 401,
      };
    }

    // Network errors
    if (axiosError.code === 'ECONNABORTED') {
      return {
        message: 'Connection timeout. Please check your network and try again.',
        code: 'TIMEOUT',
      };
    }

    if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
      return {
        message: 'Unable to reach the server. Please check the server URL.',
        code: 'UNREACHABLE',
      };
    }

    // Server errors
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        return {
          message: 'Unauthorized. Please check your API key.',
          code: 'UNAUTHORIZED',
          status,
        };
      }
      if (status === 403) {
        return {
          message: 'Access denied.',
          code: 'FORBIDDEN',
          status,
        };
      }
      if (status === 404) {
        return {
          message: 'Resource not found.',
          code: 'NOT_FOUND',
          status,
        };
      }
      if (status >= 500) {
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          status,
        };
      }
    }

    // Default axios error
    return {
      message: axiosError.message || 'An error occurred',
      code: 'AXIOS_ERROR',
      status: axiosError.response?.status,
    };
  }

  // Generic error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN',
  };
}

/**
 * Check if error is a session expiration error.
 */
export function isSessionExpired(error: ApiError): boolean {
  return error.code === 'SESSION_EXPIRED' || error.status === 401;
}
