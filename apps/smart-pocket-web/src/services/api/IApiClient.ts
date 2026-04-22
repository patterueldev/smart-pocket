/**
 * IApiClient: Interface for HTTP client operations.
 * Defines contract for making HTTP requests with automatic authentication
 * and transparent token refresh on 401 errors.
 */

export interface IApiClient {
  /**
   * Initialize API client with base URL and optional access token.
   * Must be called before making any API requests.
   * Sets up Axios instance with interceptors for token management and 401 handling.
   */
  initialize(baseUrl: string, accessToken?: string): Promise<void>;

  /**
   * Update the access token (called after refresh).
   * Updates the Authorization header in all subsequent requests.
   */
  updateAccessToken(token: string): void;

  /**
   * Make a GET request.
   * Automatically attaches Authorization header with access token.
   * On 401: Automatically refreshes token and retries request.
   */
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>;

  /**
   * Make a POST request.
   * Automatically attaches Authorization header with access token.
   * On 401: Automatically refreshes token and retries request.
   */
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;

  /**
   * Make a PUT request.
   * Automatically attaches Authorization header with access token.
   * On 401: Automatically refreshes token and retries request.
   */
  put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;

  /**
   * Make a DELETE request.
   * Automatically attaches Authorization header with access token.
   * On 401: Automatically refreshes token and retries request.
   */
  delete<T>(url: string, config?: Record<string, unknown>): Promise<T>;

  /**
   * Clear client state (used on logout).
   * Removes Authorization header and resets base URL.
   */
  reset(): void;
}
