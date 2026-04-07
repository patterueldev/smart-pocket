import { useRouter } from 'expo-router';
import React, { createContext, useState, useCallback, useRef } from 'react';
import { ServiceFactory, type IServices } from '@/services';
import { AuthTokens, AuthCredentials } from '@/types/auth';

// Use mock services for development (backend not ready yet)
// Change to 'real' when backend is available
const USE_MOCK_SERVICES = false;
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
  // Internal: Access to services (sheetsSync needs to be obtained from here)
  services?: IServices;
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
  
  
  // Store services in ref so we can update them without recreating context
  const servicesRef = useRef<IServices>(services);

  /**
   * Initialize auth state from secure storage on app startup.
   */
  const initializeFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      const { tokens, credentials } = await authService.loadStoredAuth();

      console.log('[AuthProvider] Loaded from storage:', { 
        hasTokens: !!tokens, 
        hasCredentials: !!credentials,
        baseUrl: credentials?.baseUrl 
      });

      if (tokens && credentials) {
        // Restore tokens
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setBaseUrl(credentials.baseUrl);

        console.log('[AuthProvider] Initializing API client with baseUrl:', credentials.baseUrl);
        // Initialize API client with stored token
        await apiClient.initialize(credentials.baseUrl, tokens.accessToken);
        
        console.log('[AuthProvider] API client initialized, recreating sheetsSync client');
        // Recreate sheetsSync client with initialized API client via ServiceFactory
        if (servicesRef.current.apiClient) {
          console.log('[AuthProvider] Recreating sheetsSync client with initialized ApiClient');
          servicesRef.current.sheetsSync = ServiceFactory.createSheetsSyncClient(
            USE_MOCK_SERVICES ? 'mock' : 'real',
            servicesRef.current.apiClient
          );
        }

        setIsLoggedIn(true);
        setError(null);
      } else {
        console.log('[AuthProvider] No stored credentials found');
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

      console.log('[AuthProvider] Setting up with credentials:', { apiKey: '***', baseUrl: credentials.baseUrl });
      const tokens: AuthTokens = await authService.setup(credentials);

      // Update state
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setBaseUrl(credentials.baseUrl);

      console.log('[AuthProvider] Setup successful, initializing API client with:', credentials.baseUrl);
      // Initialize API client with new credentials
      await apiClient.initialize(credentials.baseUrl, tokens.accessToken);
      
      console.log('[AuthProvider] API client initialized, recreating sheetsSync client');
      // Recreate sheetsSync client with initialized API client via ServiceFactory
      if (servicesRef.current.apiClient) {
        console.log('[AuthProvider] Recreating sheetsSync client with initialized ApiClient');
        servicesRef.current.sheetsSync = ServiceFactory.createSheetsSyncClient(
          USE_MOCK_SERVICES ? 'mock' : 'real',
          servicesRef.current.apiClient
        );
      }

      setIsLoggedIn(true);

      // Navigate to dashboard
      router.replace('/(protected)');
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
        services: servicesRef.current,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};