/**
 * Configuration utilities for Smart Pocket Web
 * Provides default values and helpers for API configuration
 */

/**
 * Get the default API base URL based on the current host
 * Examples:
 * - localhost:5173 → http://localhost:3000/api
 * - smartpocket-dev.nicenature.space → https://smartpocket-dev.nicenature.space/api
 */
export function getApiBaseUrl(): string {
  const { protocol, hostname } = window.location;

  // For development on localhost, use port 3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:3000/api`;
  }

  // For remote hosts, use same protocol/hostname with /api path
  return `${protocol}//${hostname}/api`;
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
