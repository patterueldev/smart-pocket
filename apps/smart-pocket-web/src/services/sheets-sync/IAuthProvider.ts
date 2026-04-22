/**
 * Auth Provider Interface - Abstraction for authentication
 * Allows RealSheetsSyncClient to depend on abstraction instead of callback pattern
 */
export interface IAuthProvider {
  /**
   * Get a valid access token for API requests
   * @returns Promise<string> Access token
   * @throws Error if token cannot be obtained
   */
  getAccessToken(): Promise<string>;
}
