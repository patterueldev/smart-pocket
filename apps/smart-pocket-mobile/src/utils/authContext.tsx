import { useRouter } from 'expo-router';
import React, { createContext, useState, useCallback } from 'react';
import { ServiceFactory, type IServices } from '@/services';
import { AuthTokens, AuthCredentials } from '@/types/auth';

// Use mock services for development (backend not ready yet)
// Change to 'real' when backend is available
const USE_MOCK_SERVICES = true;
const services: IServices = ServiceFactory.createServices(USE_MOCK_SERVICES ? 'mock' : 'real');
const { authService, apiClient } = services;

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  baseUrl: string | null;
  setup: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeFromStorage: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  baseUrl: null,
  setup: async () => {},
  logout: async () => {},
  clearError: () => {},
  initializeFromStorage: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Initialize auth state from secure storage on app startup.
   */
  const initializeFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      const { tokens, credentials } = await authService.loadStoredAuth();

      if (tokens && credentials) {
        // Restore tokens
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setBaseUrl(credentials.baseUrl);

        // Initialize API client with stored token
        await apiClient.initialize(credentials.baseUrl, tokens.accessToken);

        setIsLoggedIn(true);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to initialize auth from storage:', err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Setup: Authenticate with API key and base URL.
   */
  const setup = useCallback(async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const tokens: AuthTokens = await authService.setup(credentials);

      // Update state
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setBaseUrl(credentials.baseUrl);

      // Initialize API client with new credentials
      await apiClient.initialize(credentials.baseUrl, tokens.accessToken);

      setIsLoggedIn(true);

      // Navigate to dashboard
      router.replace('/(protected)/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Setup failed';
      setError(errorMessage);
      setIsLoggedIn(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Logout: Clear all stored data and reset state.
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();

      // Reset state
      setIsLoggedIn(false);
      setAccessToken(null);
      setRefreshToken(null);
      setBaseUrl(null);
      setError(null);

      // Reset API client
      apiClient.reset();

      // Navigate to setup
      router.replace('/setup');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Clear error message.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        error,
        accessToken,
        refreshToken,
        baseUrl,
        setup,
        logout,
        clearError,
        initializeFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};