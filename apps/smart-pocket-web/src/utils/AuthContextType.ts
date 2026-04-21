/**
 * AuthContext - Type definition
 * Separated for use in AuthProvider and hooks
 */

export interface AuthContextType {
  apiKey: string | null;
  apiBaseUrl: string | null;
  isSetup: boolean;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean;
  setup: (apiKey: string, apiBaseUrl: string) => Promise<void>;
  logout: () => Promise<void>;
}
