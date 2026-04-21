/**
 * Setup Screen
 * Main entry point for new users to configure their API credentials
 * Coordinates the form hook with the UI component and auth context
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiBaseUrl } from '../utils/config';
import { useSetupForm } from '../hooks/useSetupForm';
import { SetupFormUI } from '../components/SetupFormUI';

export function Setup() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const defaultApiBaseUrl = getApiBaseUrl();

  // If already authenticated, redirect to dashboard
  if (!authContext.isInitializing && authContext.isSetup) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const form = useSetupForm({
    defaultApiBaseUrl,
    onSuccess: async (credentials) => {
      await authContext.setup(credentials.apiKey, credentials.apiBaseUrl);
      navigate('/dashboard');
    },
  });

  return <SetupFormUI {...form} defaultApiBaseUrl={defaultApiBaseUrl} />;
}
