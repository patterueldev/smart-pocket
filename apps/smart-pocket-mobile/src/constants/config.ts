/**
 * Environment-specific configuration.
 * Loaded from app.config.js via Constants.expoConfig.
 * 
 * The actual environment is determined by APP_ENV variable set at build time.
 * This config module reads the API base URL from the selected environment config.
 */

import Constants from 'expo-constants';

export type Environment = 'dev' | 'qa' | 'prod';

// Get API configuration from app.config.js (via extra.api)
const apiConfig = Constants.expoConfig?.extra?.api;

if (!apiConfig || !apiConfig.baseUrl) {
  throw new Error(
    'Missing API configuration in app.config.js extras.api. ' +
    'Ensure app.config.js is properly configured and APP_ENV is set correctly.'
  );
}

export const CONFIG = {
  apiBaseUrl: apiConfig.baseUrl,
  appName: Constants.expoConfig?.name || 'Smart Pocket',
  appSlug: Constants.expoConfig?.slug || 'smart-pocket',
};

/**
 * Get the API base URL for the current environment.
 * Determined by APP_ENV variable set at build time.
 */
export function getDefaultBaseUrl(): string {
  return CONFIG.apiBaseUrl;
}

/**
 * Get app name for current environment.
 */
export function getAppName(): string {
  return CONFIG.appName;
}



