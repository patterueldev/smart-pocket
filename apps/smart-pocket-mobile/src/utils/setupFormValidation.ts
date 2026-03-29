/**
 * Pure utility functions for setup form validation
 * Extracted to allow testing without React hooks
 */

export interface ValidationError {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate API key is not empty
 */
export function validateApiKey(apiKey: string): ValidationError {
  if (!apiKey.trim()) {
    return { isValid: false, error: 'Please enter an API key' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate server URL is not empty
 */
export function validateBaseUrl(baseUrl: string): ValidationError {
  if (!baseUrl.trim()) {
    return { isValid: false, error: 'Please enter a server URL' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate URL format (must be valid URL structure)
 */
export function validateUrlFormat(baseUrl: string): ValidationError {
  let urlToUse = baseUrl.trim();
  
  // Add protocol if missing
  if (!urlToUse.startsWith('http://') && !urlToUse.startsWith('https://')) {
    urlToUse = `http://${urlToUse}`;
  }

  try {
    // Remove trailing slashes and query params for validation
    const normalizedUrl = urlToUse.split('?')[0].split('#')[0];
    new URL(normalizedUrl);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Please enter a valid server URL' };
  }
}

/**
 * Ensure URL has protocol (http:// or https://)
 */
export function ensureProtocol(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (trimmed.startsWith('http')) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

/**
 * Validate all form fields
 */
export function validateForm(apiKey: string, baseUrl: string): ValidationError {
  const apiKeyValidation = validateApiKey(apiKey);
  if (!apiKeyValidation.isValid) {
    return apiKeyValidation;
  }

  const baseUrlValidation = validateBaseUrl(baseUrl);
  if (!baseUrlValidation.isValid) {
    return baseUrlValidation;
  }

  const urlFormatValidation = validateUrlFormat(baseUrl);
  if (!urlFormatValidation.isValid) {
    return urlFormatValidation;
  }

  return { isValid: true, error: null };
}
