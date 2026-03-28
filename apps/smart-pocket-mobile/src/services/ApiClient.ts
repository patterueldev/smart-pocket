/**
 * ApiClient: HTTP client with automatic token attachment and 401 refresh.
 * Handles authorization headers and reactive token refresh on 401 errors.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './AuthService';
import { StorageService } from './StorageService';

export class ApiClient {
  private static instance: AxiosInstance | null = null;
  private static baseUrl: string = '';

  /**
   * Initialize API client with base URL.
   * Must be called before making any API requests.
   */
  static async initialize(baseUrl: string, accessToken?: string): Promise<void> {
    this.baseUrl = baseUrl;

    this.instance = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });

    // Set initial token if provided
    if (accessToken) {
      this.setAuthHeader(accessToken);
    }

    // Add request interceptor to attach token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Token is already set in header if it was initialized
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for 401 handling (token refresh)
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If we got a 401 and haven't already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await StorageService.getTokens().then((t) => t?.refreshToken);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Refresh the access token
            const newAccessToken = await AuthService.refreshAccessToken(
              this.baseUrl,
              refreshToken
            );

            // Update authorization header
            this.setAuthHeader(newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return this.instance!(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            console.error('Token refresh failed, logging out:', refreshError);
            await AuthService.logout();

            // Reject with a clear error
            return Promise.reject(
              new Error('Session expired. Please log in again.')
            );
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set the Authorization header with the given token.
   */
  private static setAuthHeader(token: string): void {
    if (this.instance) {
      this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  /**
   * Update the access token (called after refresh).
   */
  static updateAccessToken(token: string): void {
    this.setAuthHeader(token);
  }

  /**
   * Get the axios instance for making requests.
   */
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      throw new Error('ApiClient not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Make a GET request.
   */
  static async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.getInstance().get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request.
   */
  static async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.getInstance().post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request.
   */
  static async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.getInstance().put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request.
   */
  static async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.getInstance().delete<T>(url, config);
    return response.data;
  }

  /**
   * Clear client state (used on logout).
   */
  static reset(): void {
    if (this.instance) {
      this.instance.defaults.headers.common.Authorization = '';
    }
    this.baseUrl = '';
  }
}
