/**
 * SetupFormUI Component
 * Pure UI component for the setup form
 * All props are passed from useSetupForm hook - no business logic here
 */

import type { SetupFormState, SetupFormHandlers } from '../hooks/useSetupForm';
import './SetupFormUI.css';

interface SetupFormUIProps extends SetupFormState, SetupFormHandlers {
  defaultApiBaseUrl: string;
}

/**
 * Pure UI component for the setup form
 * Single Responsibility: Only renders UI and calls handlers
 */
export function SetupFormUI({
  apiKey,
  apiBaseUrl,
  error,
  isLoading,
  defaultApiBaseUrl,
  handleApiKeyChange,
  handleApiBaseUrlChange,
  handleSubmit,
}: SetupFormUIProps) {
  const isValid = apiKey.trim().length > 0 && apiBaseUrl.trim().length > 0;

  return (
    <div className="setup-form-container">
      <div className="setup-form-wrapper">
        {/* Header */}
        <div className="setup-form-header">
          <h1 className="setup-form-title">Setup Smart Pocket</h1>
          <p className="setup-form-subtitle">Enter your API credentials to get started</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="setup-form-error">
            <p>{error}</p>
          </div>
        )}

        {/* API Key Input */}
        <div className="setup-form-field">
          <label htmlFor="api-key" className="setup-form-label">
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            className="setup-form-input"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          {apiKey.length > 0 && apiKey.trim().length === 0 && (
            <p className="setup-form-field-error">API key cannot be empty</p>
          )}
        </div>

        {/* Server URL Input */}
        <div className="setup-form-field">
          <label htmlFor="api-base-url" className="setup-form-label">
            API Base URL
          </label>
          <input
            id="api-base-url"
            type="url"
            className="setup-form-input"
            placeholder={defaultApiBaseUrl}
            value={apiBaseUrl}
            onChange={(e) => handleApiBaseUrlChange(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          <p className="setup-form-field-hint">Default: {defaultApiBaseUrl}</p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="setup-form-submit"
        >
          {isLoading ? (
            <>
              <span className="setup-form-spinner"></span>
              Setting up...
            </>
          ) : (
            'Setup'
          )}
        </button>
      </div>
    </div>
  );
}
