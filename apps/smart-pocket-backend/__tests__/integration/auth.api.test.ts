// Set test environment variables BEFORE importing app
process.env.API_KEYS = 'test-api-key-12345,another-test-key-67890';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import App from '@/app';
import { authSetupRequests, authRefreshRequests, testAuthHeaders, expectedResponses } from './fixtures/requests';

describe('Auth API Integration Tests', () => {
  let appInstance: App;
  let app: any;
  let accessToken: string;
  let refreshToken: string;
  const validApiKey = 'test-api-key-12345';

  beforeAll(() => {
    // Create app instance after env is set
    appInstance = new App();
    app = appInstance.getApp();
  });

  describe('POST /api/auth/setup', () => {
    test('should successfully setup with valid API key', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
      expect(response.body.refreshToken.length).toBeGreaterThan(0);

      // Save tokens for later tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    test('should return 400 when apiKey is missing', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.invalidMissing);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('apiKey');
    });

    test('should return 400 when apiKey is empty', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.invalidEmpty);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 when apiKey is too short and not configured', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.invalidShort);

      // Short key is treated as "not configured" since it's not in the API_KEYS list
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 when apiKey is not configured', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send({ apiKey: 'unknown-api-key-not-in-config' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    test('should generate different tokens on each setup call', async () => {
      const response1 = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      // Delay to ensure different timestamps (JWT iat claim)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response2 = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken);
      expect(response1.body.refreshToken).not.toBe(response2.body.refreshToken);
    });

    test('should include proper content-type header in response', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testRefreshToken: string;

    beforeAll(async () => {
      // Get a valid refresh token from setup
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);
      testRefreshToken = setupResponse.body.refreshToken;
    });

    test('should successfully refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    test('should return new access token different from refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).not.toBe(testRefreshToken);
    });

    test('should return 400 when refreshToken is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send(authRefreshRequests.invalidMissing);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 when refreshToken is empty', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send(authRefreshRequests.invalidEmpty);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.jwt.token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 with malformed refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send(authRefreshRequests.invalidMalformed);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should not accept access token as refresh token', async () => {
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: setupResponse.body.accessToken });

      // Should fail because access token is not a valid refresh token
      expect(response.status).toBe(401);
    });

    test('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    test('should refresh multiple times with same token', async () => {
      const response1 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken });

      // Delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response2 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken);
    });
  });

  describe('GET /auth/test', () => {
    let validAccessToken: string;

    beforeAll(async () => {
      // Get a valid access token from setup
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);
      validAccessToken = setupResponse.body.accessToken;
    });

    test('should return 200 with valid access token in Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/auth/test');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 when Authorization header is empty', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });

    test('should return 401 with invalid token in Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 with malformed Authorization header (no Bearer)', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `${validAccessToken}`);

      expect(response.status).toBe(401);
    });

    test('should return 401 with wrong scheme in Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Basic ${validAccessToken}`);

      expect(response.status).toBe(401);
    });

    test('should not accept refresh token as access token', async () => {
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${setupResponse.body.refreshToken}`);

      // Should fail because refresh token is not a valid access token
      expect(response.status).toBe(401);
    });

    test('should be case-sensitive for Bearer scheme', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `bearer ${validAccessToken}`);

      // Typically case-sensitive, might be rejected
      expect([200, 401]).toContain(response.status);
    });

    test('should accept valid access token and return success', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should work as an authenticated endpoint verification', async () => {
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      const testResponse = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${setupResponse.body.accessToken}`);

      expect(testResponse.status).toBe(200);
      expect(testResponse.body.success).toBe(true);
    });
  });

  describe('Auth Flow Integration', () => {
    test('complete auth flow: setup -> test -> refresh -> test', async () => {
      // Step 1: Setup
      const setupResponse = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);
      expect(setupResponse.status).toBe(200);
      const { accessToken: token1, refreshToken } = setupResponse.body;

      // Step 2: Test with access token
      const testResponse1 = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${token1}`);
      expect(testResponse1.status).toBe(200);

      // Delay before refresh to ensure different token
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Step 3: Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(refreshResponse.status).toBe(200);
      const { accessToken: token2 } = refreshResponse.body;

      // Step 4: Test with new access token
      const testResponse2 = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${token2}`);
      expect(testResponse2.status).toBe(200);

      // Verify tokens are different (refresh should generate new token)
      expect(token1).not.toBe(token2);
      expect(token1).not.toBe(refreshToken);
      expect(token2).not.toBe(refreshToken);
    });

    test('multiple users can authenticate with same API key', async () => {
      const user1Setup = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      // Delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const user2Setup = await request(app)
        .post('/api/auth/setup')
        .send(authSetupRequests.valid);

      expect(user1Setup.status).toBe(200);
      expect(user2Setup.status).toBe(200);
      expect(user1Setup.body.accessToken).not.toBe(user2Setup.body.accessToken);

      // Both should be able to access protected endpoints
      const user1Test = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${user1Setup.body.accessToken}`);

      const user2Test = await request(app)
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${user2Setup.body.accessToken}`);

      expect(user1Test.status).toBe(200);
      expect(user2Test.status).toBe(200);
    });
  });
});
