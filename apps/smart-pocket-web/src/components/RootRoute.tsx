/**
 * RootRoute Component
 * Smart routing for the root path (/)
 * Redirects to /dashboard if authenticated, /setup if not
 * Waits for auth initialization before deciding
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RootRoute() {
  const authContext = useAuth();

  // While initializing, don't redirect yet
  if (authContext.isInitializing) {
    return <div>Loading...</div>;
  }

  // If user is already set up, go to dashboard
  // Otherwise, go to setup page
  return <Navigate to={authContext.isSetup ? '/dashboard' : '/setup'} replace />;
}
