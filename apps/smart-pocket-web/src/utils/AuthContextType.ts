/**
 * AuthContext - Type definition
 * Separated for use in AuthProvider and hooks
 */

export interface AuthContextType {
  apiKey: string | null;
  apiBaseUrl: string | null;
  isSetup: boolean;
  setup: (apiKey: string, apiBaseUrl: string) => void;
  logout: () => void;
}
