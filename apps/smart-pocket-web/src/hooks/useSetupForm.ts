/**
 * useSetupForm Hook
 * Manages form state for the setup page (API key and base URL inputs)
 * Mirrors the mobile app's useSetupForm pattern
 */

import { useState } from 'react';
import { isValidUrl, isValidApiKey } from '../utils/config';

export interface SetupFormState {
  apiKey: string;
  apiBaseUrl: string;
  error: string | null;
  isLoading: boolean;
}

export interface SetupFormHandlers {
  handleApiKeyChange: (value: string) => void;
  handleApiBaseUrlChange: (value: string) => void;
  handleSubmit: () => Promise<void>;
}

interface UseSetupFormProps {
  defaultApiBaseUrl: string;
  onSuccess: (credentials: { apiKey: string; apiBaseUrl: string }) => void;
  getErrorMessage?: () => string | null;
}

/**
 * Custom hook to manage setup form state and validation
 * Handles form input, validation, and submission logic
 *
 * Single Responsibility: Manages form state and validation only
 * All business logic for setup is contained here, separated from UI
 *
 * @param defaultApiBaseUrl - Default API base URL to pre-fill
 * @param onSuccess - Callback when setup succeeds
 * @param getErrorMessage - Callback to get error message from context
 * @returns Form state and handlers for UI component to use
 */
export function useSetupForm({
  defaultApiBaseUrl,
  onSuccess,
  getErrorMessage,
}: UseSetupFormProps): SetupFormState & SetupFormHandlers {
  const [apiKey, setApiKey] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState(defaultApiBaseUrl);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setError(null);
  };

  const handleApiBaseUrlChange = (value: string) => {
    setApiBaseUrl(value);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate before submitting
    if (!isValidApiKey(apiKey)) {
      setError('API key is required');
      return;
    }

    if (!isValidUrl(apiBaseUrl)) {
      setError('Invalid API base URL');
      return;
    }

    setIsLoading(true);
    try {
      await onSuccess({
        apiKey: apiKey.trim(),
        apiBaseUrl: apiBaseUrl.trim(),
      });
    } catch {
      setError(getErrorMessage?.() || 'Failed to setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKey,
    apiBaseUrl,
    error,
    isLoading,
    handleApiKeyChange,
    handleApiBaseUrlChange,
    handleSubmit,
  };
}
