/**
 * Setup Screen
 * Main entry point for new users to configure their API credentials
 * Coordinates the form hook with the UI component and auth context
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiBaseUrl } from '../utils/config';
import { useSetupForm } from '../hooks/useSetupForm';
import { SetupFormUI } from '../components/SetupFormUI';
import { MainLayout } from '../components/MainLayout';

export function Setup() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const defaultApiBaseUrl = getApiBaseUrl();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authContext.isInitializing && authContext.isSetup) {
      navigate('/dashboard', { replace: true });
    }
  }, [authContext.isInitializing, authContext.isSetup, navigate]);

  const form = useSetupForm({
    defaultApiBaseUrl,
    onSuccess: async (credentials) => {
      await authContext.setup(credentials.apiKey, credentials.apiBaseUrl);
      navigate('/dashboard');
    },
  });

  // Show loading while initializing
  if (authContext.isInitializing) {
    return (
      <MainLayout title="Loading..." showNavigation={false}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Initializing application...
        </div>
      </MainLayout>
    );
  }

  // Show setup form only if not authenticated
  if (!authContext.isSetup) {
    return (
      <MainLayout
        title="Smart Pocket Setup"
        subtitle="Configure your API credentials"
        showNavigation={false}
      >
        <SetupFormUI {...form} defaultApiBaseUrl={defaultApiBaseUrl} />
      </MainLayout>
    );
  }

  return null;
}
