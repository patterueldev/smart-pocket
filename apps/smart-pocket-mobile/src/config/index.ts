import Constants from 'expo-constants';

/**
 * Mobile App Configuration
 * Environment-specific settings for features and services
 * 
 * All configuration is driven by APP_ENV environment variable set at build time.
 * APP_ENV determines which environment config from app.config.js is used.
 */

/**
 * Get API base URL from app.config.js (set by APP_ENV at build time)
 * 
 * Throws error if configuration is missing - this indicates APP_ENV was not
 * properly passed during the build or app.config.js is misconfigured.
 */
const getApiBaseUrl = (): string => {
  const configuredUrl = Constants.expoConfig?.extra?.api?.baseUrl;
  
  if (!configuredUrl) {
    throw new Error(
      'Missing API configuration in app.config.js extras.api.baseUrl. ' +
      'This value should be set by app.config.js based on the APP_ENV environment variable. ' +
      'Ensure the build includes: APP_ENV=<dev|qa|prod> npx expo prebuild'
    );
  }

  return configuredUrl;
};

/**
 * Feature flags and service configuration
 */
export const config = {
  /**
   * Sheets Sync Service Mode
   * 
   * 'mock' - Uses MockSheetsSyncClient for development
   *          Returns synthetic data, useful for UI/UX testing
   *          No backend dependency
   * 
   * 'real' - Uses RealSheetsSyncClient for production
   *          Makes actual HTTP calls to backend /sheets-sync endpoints
   *          Requires backend to be running
   * 
   * Default: 'mock' (safe for development)
   * Override: Set USE_REAL_SHEETS_SYNC environment variable to 'true'
   */
  sheets_sync_mode: (process.env.USE_REAL_SHEETS_SYNC === 'true' ? 'real' : 'mock') as
    | 'real'
    | 'mock',

  /**
   * Debug mode for services
   * Logs additional information to console
   */
  debug: process.env.DEBUG === 'true' || process.env.APP_ENV === 'dev',

  /**
   * API Configuration
   * Backend base URL comes from app.config.js (set by APP_ENV at build time)
   */
  api: {
    baseUrl: getApiBaseUrl(),
  },
};

/**
 * Log current configuration (useful for debugging)
 */
if (config.debug) {
  console.log('[Config] Loaded configuration:', {
    sheets_sync_mode: config.sheets_sync_mode,
    debug: config.debug,
    api_base_url: config.api.baseUrl,
  });
}

export default config;
