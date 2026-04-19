/**
 * AuthProvider Component
 * Provides authentication context to the app
 * Manages API configuration with localStorage persistence
 */

import { useState, type ReactNode } from 'react';
import { AuthContext } from '../utils/createAuthContext';
import type { AuthContextType } from '../utils/AuthContextType';

function loadAuthState(): Omit<AuthContextType, 'setup' | 'logout'> {
  const apiKey = localStorage.getItem('sp_api_key');
  const apiBaseUrl = localStorage.getItem('sp_api_base_url');
  const isSetup = !!apiKey && !!apiBaseUrl;

  return { apiKey, apiBaseUrl, isSetup };
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider manages authentication state for the app
 * Persists configuration to localStorage for persistence across page reloads
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initialState = loadAuthState();
  const [apiKey, setApiKey] = useState<string | null>(initialState.apiKey);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(initialState.apiBaseUrl);
  const [isSetup, setIsSetup] = useState(initialState.isSetup);

  const setup = (apiKey: string, apiBaseUrl: string) => {
    localStorage.setItem('sp_api_key', apiKey);
    localStorage.setItem('sp_api_base_url', apiBaseUrl);
    setApiKey(apiKey);
    setApiBaseUrl(apiBaseUrl);
    setIsSetup(true);
  };

  const logout = () => {
    localStorage.removeItem('sp_api_key');
    localStorage.removeItem('sp_api_base_url');
    setApiKey(null);
    setApiBaseUrl(null);
    setIsSetup(false);
  };

  const value: AuthContextType = {
    apiKey,
    apiBaseUrl,
    isSetup,
    setup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
