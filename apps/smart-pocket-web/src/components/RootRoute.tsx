/**
 * RootRoute Component
 * Smart routing for the root path (/)
 * Redirects to /dashboard if authenticated, /setup if not
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RootRoute() {
  const authContext = useAuth();

  // If user is already set up, go to dashboard
  // Otherwise, go to setup page
  return <Navigate to={authContext.isSetup ? '/dashboard' : '/setup'} replace />;
}
