import App from '../../../src/app';

/**
 * Get Express app instance for testing
 * Initializes the app without starting a server
 */
export const getTestApp = () => {
  return App;
};

/**
 * Helper to make requests easier in tests
 */
export const testRequest = {
  /**
   * Create valid auth setup request
   */
  validSetup: (apiKey = 'test-api-key') => ({
    apiKey,
  }),

  /**
   * Create refresh token request
   */
  refresh: (refreshToken: string) => ({
    refreshToken,
  }),

  /**
   * Create invalid setup request (missing apiKey)
   */
  invalidSetupMissing: () => ({}),

  /**
   * Create invalid setup request (empty apiKey)
   */
  invalidSetupEmpty: () => ({
    apiKey: '',
  }),
};

/**
 * Test data constants
 */
export const testData = {
  validApiKey: 'test-api-key-12345',
  validApiKey2: 'another-test-key-67890',
  invalidApiKey: 'this-is-not-in-config',
  testAccessToken: 'test.access.token',
  testRefreshToken: 'test.refresh.token',
};
