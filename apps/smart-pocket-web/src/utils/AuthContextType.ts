/**
 * AuthContext - Type definition
 * Separated for use in AuthProvider and hooks
 * 
 * Note: This type is compatible with IAuthProvider from sheets-sync service
 * as it provides the getAccessToken() method required by RealSheetsSyncClient
 */

export interface AuthContextType {
  apiKey: string | null;
  apiBaseUrl: string | null;
  accessToken: string | null;
  isSetup: boolean;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean;
  setup: (apiKey: string, apiBaseUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}
