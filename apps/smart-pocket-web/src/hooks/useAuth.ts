/**
 * useAuth Hook
 * Custom hook to use the auth context
 * Must be called from within an AuthProvider
 */

import { useContext } from 'react';
import { AuthContext } from '../utils/createAuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
