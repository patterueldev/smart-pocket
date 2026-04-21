/**
 * AuthProvider Component
 * Provides authentication context to the app
 * Manages API configuration and authentication state with localStorage persistence
 */

import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from '../utils/createAuthContext';
import type { AuthContextType } from '../utils/AuthContextType';
import { ServiceFactory } from '../services/ServiceFactory';
import type { AuthCredentials } from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider manages authentication state for the app
 * Handles setup, logout, and token management through AuthService
 * Persists configuration to localStorage for persistence across page reloads
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = ServiceFactory.getAuthService();

  // Load stored auth on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const { credentials, tokens } = await authService.loadStoredAuth();
        if (credentials && tokens) {
          setApiKey(credentials.apiKey);
          setApiBaseUrl(credentials.baseUrl);
          setIsSetup(true);
        }
      } catch (err) {
        console.error('Failed to load stored auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to load authentication');
      }
    };

    loadStoredAuth();
  }, [authService]);

  const setup = async (apiKey: string, apiBaseUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials: AuthCredentials = { apiKey, baseUrl: apiBaseUrl };
      await authService.setup(credentials);
      
      // Also keep in localStorage for backward compatibility
      localStorage.setItem('sp_api_key', apiKey);
      localStorage.setItem('sp_api_base_url', apiBaseUrl);
      
      setApiKey(apiKey);
      setApiBaseUrl(apiBaseUrl);
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
      localStorage.removeItem('sp_api_key');
      localStorage.removeItem('sp_api_base_url');
      setApiKey(null);
      setApiBaseUrl(null);
      setIsSetup(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', errorMessage);
      // Even on error, clear UI state
      setApiKey(null);
      setApiBaseUrl(null);
      setIsSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    apiKey,
    apiBaseUrl,
    isSetup,
    setup,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
