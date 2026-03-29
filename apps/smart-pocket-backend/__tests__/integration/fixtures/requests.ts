/**
 * Test fixtures for API requests
 */

export const authSetupRequests = {
  valid: {
    apiKey: 'test-api-key-12345',
  },
  invalidMissing: {},
  invalidEmpty: {
    apiKey: '',
  },
  invalidShort: {
    apiKey: 'short',
  },
};

export const authRefreshRequests = {
  valid: {
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  invalidMissing: {},
  invalidEmpty: {
    refreshToken: '',
  },
  invalidMalformed: {
    refreshToken: 'not-a-jwt',
  },
};

export const testAuthHeaders = {
  valid: (token: string) => ({
    Authorization: `Bearer ${token}`,
  }),
  missing: () => ({}),
  invalid: () => ({
    Authorization: 'Bearer invalid-token',
  }),
  malformed: () => ({
    Authorization: 'InvalidScheme token',
  }),
};

export const expectedResponses = {
  setupSuccess: {
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
  },
  refreshSuccess: {
    accessToken: expect.any(String),
  },
  authTestSuccess: {
    success: true,
  },
  healthSuccess: {
    status: 'ok',
  },
  error400: {
    success: false,
    message: expect.any(String),
  },
  error401: {
    success: false,
    message: expect.any(String),
  },
};
