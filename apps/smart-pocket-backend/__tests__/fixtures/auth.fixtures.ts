/**
 * Shared test fixtures and test data
 */

export const testApiKey = 'test-api-key-12345';
export const testApiKey2 = 'another-api-key-67890';
export const invalidApiKey = 'invalid-key';

export const testSetupRequest = {
  apiKey: testApiKey,
  baseUrl: 'http://localhost:3000',
};

export const validSetupRequests = [
  {
    apiKey: 'valid-key-1',
    baseUrl: 'http://localhost:3000',
  },
  {
    apiKey: 'valid-key-123456789',
    baseUrl: 'https://example.com',
  },
  {
    apiKey: 'a'.repeat(10),
    baseUrl: 'http://192.168.1.1:8080',
  },
];

export const invalidSetupRequests = [
  {
    apiKey: 'short',
    baseUrl: 'http://localhost:3000',
    error: 'apiKey must be at least 10 characters',
  },
  {
    apiKey: testApiKey,
    baseUrl: 'not-a-url',
    error: 'baseUrl must be a valid URL',
  },
  {
    apiKey: '',
    baseUrl: 'http://localhost:3000',
    error: 'apiKey is required',
  },
  {
    apiKey: testApiKey,
    baseUrl: '',
    error: 'baseUrl is required',
  },
];

export const testRefreshToken = 'test.refresh.token.12345';
export const invalidRefreshToken = 'invalid.token';
export const expiredRefreshToken = 'expired.token';

export const testAccessToken = 'test.access.token.12345';

export const testTokenPayload = {
  apiKey: testApiKey,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const testTokens = {
  accessToken: testAccessToken,
  refreshToken: testRefreshToken,
  expiresIn: 3600,
};
