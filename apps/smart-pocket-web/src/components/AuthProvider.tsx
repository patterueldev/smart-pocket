/**
 * AuthProvider Component
 * Provides authentication context to the app
 * Manages API configuration, tokens, and authentication state with localStorage persistence
 */

import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from '../utils/createAuthContext';
import type { AuthContextType } from '../utils/AuthContextType';
import { ServiceFactory } from '../services/ServiceFactory';
import type { AuthCredentials } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider manages authentication state for the app
 * Handles setup, logout, and token management through AuthService
 * Persists configuration to localStorage for persistence across page reloads
 * Manages ApiClient lifecycle with automatic token refresh on 401 errors
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const authService = ServiceFactory.getAuthService();
  const apiClient = ServiceFactory.getApiClient();

  // Load stored auth on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const { credentials, tokens } = await authService.loadStoredAuth();
        console.log('[AuthProvider] Loaded from storage:', {
          hasCredentials: !!credentials,
          hasTokens: !!tokens,
          credentialsApiKey: credentials?.apiKey ? '***' : undefined,
        });
        // Credentials alone are enough to mark as setup
        // Tokens will be refreshed on next API call if needed
        if (credentials) {
          console.log('[AuthProvider] Restoring auth state from storage');
          setApiKey(credentials.apiKey);
          setApiBaseUrl(credentials.baseUrl);
          
          // Initialize API client with stored token (if available)
          if (tokens?.accessToken) {
            console.log('[AuthProvider] Initializing API client with stored token');
            await apiClient.initialize(credentials.baseUrl, tokens.accessToken);
            setAccessToken(tokens.accessToken);
          } else {
            console.log('[AuthProvider] Initializing API client without token');
            await apiClient.initialize(credentials.baseUrl);
          }
          
          setIsSetup(true);
        }
        if (!credentials) {
          console.log('[AuthProvider] No stored credentials found');
        }
      } catch (err) {
        console.error('Failed to load stored auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to load authentication');
      } finally {
        setIsInitializing(false);
      }
    };

    loadStoredAuth();
  }, [authService, apiClient]);

  const getAccessToken = async (): Promise<string> => {
    if (accessToken) {
      return accessToken;
    }
    
    // If no access token but we have refresh capability, we could refresh here
    // For now, throw an error as the user must re-authenticate
    throw new Error('No access token available. Please log in again.');
  };

  const getApiBaseUrl = (): string => {
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured. Please complete setup first.');
    }
    return apiBaseUrl;
  };

  const setup = async (apiKey: string, apiBaseUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials: AuthCredentials = { apiKey, baseUrl: apiBaseUrl };
      const tokens = await authService.setup(credentials);
      
      // Also keep in localStorage for backward compatibility
      localStorage.setItem('sp_api_key', apiKey);
      localStorage.setItem('sp_api_base_url', apiBaseUrl);
      
      // Initialize API client with new credentials
      console.log('[AuthProvider] Initializing API client after setup');
      await apiClient.initialize(apiBaseUrl, tokens.accessToken);
      
      setApiKey(apiKey);
      setApiBaseUrl(apiBaseUrl);
      setAccessToken(tokens.accessToken);
      setIsSetup(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Setup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      apiClient.reset();
      localStorage.removeItem('sp_api_key');
      localStorage.removeItem('sp_api_base_url');
      setApiKey(null);
      setApiBaseUrl(null);
      setAccessToken(null);
      setIsSetup(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', errorMessage);
      // Even on error, clear UI state
      setApiKey(null);
      setApiBaseUrl(null);
      setAccessToken(null);
      setIsSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    apiKey,
    apiBaseUrl,
    accessToken,
    isSetup,
    setup,
    logout,
    getAccessToken,
    getApiBaseUrl,
    isLoading,
    error,
    isInitializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
