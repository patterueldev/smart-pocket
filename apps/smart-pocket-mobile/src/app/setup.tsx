import React, { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';
import { useSetupForm } from '@/hooks/useSetupForm';
import { SetupFormUI } from '@/components/SetupFormUI';
import { getDefaultBaseUrl } from '@/constants/config';

/**
 * Setup screen component.
 * Composes the form hook (business logic) with form UI (presentation).
 * 
 * Single Responsibility: Coordinate form logic and UI rendering.
 */
export default function SetupScreen() {
  const authContext = useContext(AuthContext);
  const defaultBaseUrl = getDefaultBaseUrl();

  const form = useSetupForm({
    defaultBaseUrl,
    onSuccess: (credentials) => authContext.setup(credentials),
    getErrorMessage: () => authContext.error || null,
  });

  return (
    <SetupFormUI
      {...form}
      defaultBaseUrl={defaultBaseUrl}
    />
  );
}
