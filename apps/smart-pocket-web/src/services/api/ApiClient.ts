/**
 * ApiClient: HTTP client with automatic token attachment and 401 refresh.
 * Handles authorization headers and reactive token refresh on 401 errors.
 * 
 * Features:
 * - Automatic Authorization header attachment
 * - 401 error handling with automatic token refresh
 * - Transparent retry of failed requests with new token
 * - Prevents infinite retry loops with _retry flag
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { IApiClient } from './IApiClient';
import type { IAuthService } from '../auth/IAuthService';
import type { IStorageService } from '../storage/IStorageService';

export class ApiClient implements IApiClient {
  private instance: AxiosInstance | null = null;
  private baseUrl: string = '';

  constructor(
    private authService: IAuthService,
    private storageService: IStorageService
  ) {}

  async initialize(baseUrl: string, accessToken?: string): Promise<void> {
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
            const tokens = await this.storageService.getTokens();
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token available');
            }

            // Refresh the access token
            const newAccessToken = await this.authService.refreshAccessToken(
              this.baseUrl,
              tokens.refreshToken
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
            console.error('[ApiClient] Token refresh failed, logging out:', refreshError);
            await this.authService.logout();

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

  private setAuthHeader(token: string): void {
    if (this.instance) {
      this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  updateAccessToken(token: string): void {
    this.setAuthHeader(token);
  }

  private getInstance(): AxiosInstance {
    if (!this.instance) {
      throw new Error('ApiClient not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.getInstance().get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.getInstance().post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.getInstance().put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.getInstance().delete<T>(url, config);
    return response.data;
  }

  reset(): void {
    if (this.instance) {
      this.instance.defaults.headers.common.Authorization = '';
    }
    this.baseUrl = '';
  }
}
