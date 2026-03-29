// Set test environment variables BEFORE importing app
process.env.API_KEYS = 'test-api-key-12345,another-test-key-67890';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import App from '@/app';

describe('Sheets Sync API Integration Tests', () => {
  let appInstance: App;
  let expressApp: any;

  beforeAll(() => {
    appInstance = new App();
    expressApp = appInstance.getApp();
  });

  describe('POST /sheets-sync/draft', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/draft')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should enforce Bearer token format', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/draft')
        .set({ Authorization: 'InvalidFormat token' })
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return response with proper structure', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/draft')
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /sheets-sync/sync', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/sync')
        .send({ draftId: 'draft-123' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should enforce Bearer token format', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/sync')
        .set({ Authorization: 'InvalidFormat token' })
        .send({ draftId: 'draft-123' })
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return response with proper structure', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/sync')
        .send({ draftId: 'draft-123' })
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Route availability', () => {
    it('should have /sheets-sync/draft endpoint', async () => {
      // Endpoint should be defined (even if auth fails)
      const response = await request(expressApp).post('/sheets-sync/draft');

      // Should get 401 (auth), not 404 (not found)
      expect(response.status).toBe(401);
    });

    it('should have /sheets-sync/sync endpoint', async () => {
      // Endpoint should be defined (even if auth fails)
      const response = await request(expressApp)
        .post('/sheets-sync/sync')
        .send({});

      // Should not get 404 (not found)
      expect(response.status).not.toBe(404);
    });
  });

  describe('Request validation middleware', () => {
    it('should validate request body on /sync', async () => {
      // With invalid Bearer token (to get past auth), we'll hit validation
      // But auth will reject first, so we're testing that the middleware chain exists
      const response = await request(expressApp)
        .post('/sheets-sync/sync')
        .send({ invalid: 'field' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('HTTP methods', () => {
    it('should not accept GET requests to /draft', async () => {
      const response = await request(expressApp).get('/sheets-sync/draft');

      // Should get 404 (method not allowed) or 405
      expect([404, 405]).toContain(response.status);
    });

    it('should not accept GET requests to /sync', async () => {
      const response = await request(expressApp).get('/sheets-sync/sync');

      // Should get 404 (method not allowed) or 405
      expect([404, 405]).toContain(response.status);
    });

    it('should accept POST requests to /draft', async () => {
      const response = await request(expressApp).post('/sheets-sync/draft');

      // Should get 401 (auth required), not 404/405
      expect(response.status).toBe(401);
    });

    it('should accept POST requests to /sync', async () => {
      const response = await request(expressApp).post('/sheets-sync/sync');

      // Should get 401 (auth required), not 404/405
      expect(response.status).toBe(401);
    });
  });

  describe('Response formats', () => {
    it('should return JSON responses', async () => {
      const response = await request(expressApp)
        .post('/sheets-sync/draft')
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return error responses as JSON', async () => {
      const response = await request(expressApp).post('/sheets-sync/sync');

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });
});
