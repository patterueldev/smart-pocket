/**
 * Protected Route Component
 * Ensures a route is only accessible if the user is authenticated (setup)
 * Waits for auth initialization before deciding whether to redirect
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authContext = useAuth();

  // Wait for auth initialization to complete before checking protection
  if (authContext.isInitializing) {
    return <div style={{ padding: '20px' }}>Loading auth state...</div>;
  }

  // If not authenticated, redirect to setup
  if (!authContext.isSetup) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
