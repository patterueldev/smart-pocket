/**
 * Mobile App Configuration
 * Environment-specific settings for features and services
 */

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
   * Backend base URL (will be configured at runtime)
   */
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
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
