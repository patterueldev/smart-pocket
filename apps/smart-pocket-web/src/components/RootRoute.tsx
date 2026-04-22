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

  console.log('[RootRoute] Rendering with state:', {
    isInitializing: authContext.isInitializing,
    isSetup: authContext.isSetup,
    apiKey: authContext.apiKey ? '***' : null,
  });

  // While initializing, don't redirect yet
  if (authContext.isInitializing) {
    console.log('[RootRoute] Still initializing, showing loading message');
    return <div style={{ padding: '20px' }}>Loading auth state...</div>;
  }

  console.log('[RootRoute] Initialization complete, redirecting to:', authContext.isSetup ? '/dashboard' : '/setup');

  // If user is already set up, go to dashboard
  // Otherwise, go to setup page
  return <Navigate to={authContext.isSetup ? '/dashboard' : '/setup'} replace />;
}
