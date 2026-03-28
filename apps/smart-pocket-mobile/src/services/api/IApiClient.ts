/**
 * IApiClient: Interface for HTTP client operations.
 * Defines contract for making HTTP requests with automatic authentication.
 */

export interface IApiClient {
  /**
   * Initialize API client with base URL and optional access token.
   * Must be called before making any API requests.
   */
  initialize(baseUrl: string, accessToken?: string): Promise<void>;

  /**
   * Update the access token (called after refresh).
   */
  updateAccessToken(token: string): void;

  /**
   * Make a GET request.
   */
  get<T>(url: string, config?: any): Promise<T>;

  /**
   * Make a POST request.
   */
  post<T>(url: string, data?: any, config?: any): Promise<T>;

  /**
   * Make a PUT request.
   */
  put<T>(url: string, data?: any, config?: any): Promise<T>;

  /**
   * Make a DELETE request.
   */
  delete<T>(url: string, config?: any): Promise<T>;

  /**
   * Clear client state (used on logout).
   */
  reset(): void;
}
