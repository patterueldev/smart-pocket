/**
 * Configuration utilities for Smart Pocket Web
 * Provides default values and helpers for API configuration
 */

/**
 * Get the default API base URL based on the current host
 * Examples:
 * - localhost:5173 → http://localhost:3000
 * - smartpocket-dev.nicenature.space → https://smartpocketapi-dev.nicenature.space
 */
export function getApiBaseUrl(): string {
  const { protocol, hostname } = window.location;

  // For development on localhost, use port 3000 on the same host
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:3000`;
  }

  // For remote hosts (smartpocket-dev.*), use the API backend domain (smartpocketapi-dev.*)
  if (hostname === 'smartpocket-dev.nicenature.space') {
    return `${protocol}//smartpocketapi-dev.nicenature.space`;
  }

  // Default: use same protocol/hostname
  return `${protocol}//${hostname}`;
}

/**
 * Validate if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if an API key is valid (non-empty)
 */
export function isValidApiKey(key: string): boolean {
  return key.trim().length > 0;
}
