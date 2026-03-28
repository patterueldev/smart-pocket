/**
 * MockApiClient: Mock HTTP client for testing and development.
 * Simulates API responses without making real HTTP requests.
 */

import { IApiClient } from './IApiClient';

export class MockApiClient implements IApiClient {
  private baseUrl: string = '';
  private accessToken: string = '';

  async initialize(baseUrl: string, accessToken?: string): Promise<void> {
    this.baseUrl = baseUrl;
    if (accessToken) {
      this.accessToken = accessToken;
    }
  }

  updateAccessToken(token: string): void {
    this.accessToken = token;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    console.log(`[MockApiClient] GET ${this.baseUrl}${url}`);
    // Return empty object as mock response
    return {} as T;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    console.log(`[MockApiClient] POST ${this.baseUrl}${url}`, data);
    // Return empty object as mock response
    return {} as T;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    console.log(`[MockApiClient] PUT ${this.baseUrl}${url}`, data);
    // Return empty object as mock response
    return {} as T;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    console.log(`[MockApiClient] DELETE ${this.baseUrl}${url}`);
    // Return empty object as mock response
    return {} as T;
  }

  reset(): void {
    this.baseUrl = '';
    this.accessToken = '';
  }
}
