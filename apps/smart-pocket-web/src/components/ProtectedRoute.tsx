/**
 * Protected Route Component
 * Ensures a route is only accessible if the user is authenticated (setup)
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authContext = useAuth();

  if (!authContext.isSetup) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
