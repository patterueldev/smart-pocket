/**
 * Custom hook for accessing authentication context.
 * Provides type-safe access to auth state and methods.
 */

import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
