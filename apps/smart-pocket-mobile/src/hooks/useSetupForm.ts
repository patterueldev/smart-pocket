import { useState } from 'react';

export interface SetupFormState {
  apiKey: string;
  baseUrl: string;
  error: string | null;
  isLoading: boolean;
}

export interface SetupFormHandlers {
  handleApiKeyChange: (text: string) => void;
  handleBaseUrlChange: (text: string) => void;
  handleSubmit: () => Promise<void>;
}

interface UseSetupFormProps {
  defaultBaseUrl: string;
  onSuccess: (credentials: { apiKey: string; baseUrl: string }) => Promise<void>;
  getErrorMessage?: () => string | null;
}

/**
 * Custom hook to manage setup form state and validation.
 * Handles form input, validation, and submission logic.
 * 
 * Single Responsibility: Only manages form state and validation.
 * All business logic for setup is contained here, separated from UI.
 * 
 * @param defaultBaseUrl - Default server URL to pre-fill
 * @param onSuccess - Callback when setup succeeds (e.g., authContext.setup)
 * @param getErrorMessage - Callback to get error message from context
 * @returns Form state and handlers for UI component to use
 */
export function useSetupForm({
  defaultBaseUrl,
  onSuccess,
  getErrorMessage,
}: UseSetupFormProps): SetupFormState & SetupFormHandlers {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeyChange = (text: string) => {
    setApiKey(text);
    setError(null);
  };

  const handleBaseUrlChange = (text: string) => {
    setBaseUrl(text);
    setError(null);
  };

  const validate = (): boolean => {
    // Validate API key (must not be empty)
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return false;
    }

    // Validate base URL
    if (!baseUrl.trim()) {
      setError('Please enter a server URL');
      return false;
    }

    // URL format validation
    const urlToUse = baseUrl.trim().startsWith('http')
      ? baseUrl.trim()
      : `http://${baseUrl.trim()}`;

    try {
      new URL(urlToUse);
    } catch {
      setError('Please enter a valid server URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate form
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Ensure URL has protocol
      const urlToUse = baseUrl.trim().startsWith('http')
        ? baseUrl.trim()
        : `http://${baseUrl.trim()}`;

      await onSuccess({
        apiKey: apiKey.trim(),
        baseUrl: urlToUse,
      });
    } catch {
      // Error is already set in context, display it
      const contextError = getErrorMessage?.();
      setError(contextError || 'Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKey,
    baseUrl,
    error,
    isLoading,
    handleApiKeyChange,
    handleBaseUrlChange,
    handleSubmit,
  };
}
