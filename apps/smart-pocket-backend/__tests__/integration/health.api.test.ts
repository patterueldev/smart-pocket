// Set test environment variables BEFORE importing app
process.env.NODE_ENV = 'test';

import request from 'supertest';
import App from '@/app';

describe('Health API Integration Tests', () => {
  let appInstance: App;
  let app: any;

  beforeAll(() => {
    appInstance = new App();
    app = appInstance.getApp();
  });

  describe('GET /health', () => {
    test('should return 200 with healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    test('should return JSON response', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should not require authentication', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
    });

    test('should work without Authorization header', async () => {
      const response = await request(app)
        .get('/health')
        .set('Authorization', '');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should include message and timestamp', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
    });

    test('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      // Check that timestamp is a valid ISO string
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp instanceof Date).toBe(true);
      expect(Number.isNaN(timestamp.getTime())).toBe(false);
    });

    test('should handle multiple rapid requests', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app)
            .get('/health')
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/health');

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/secret/i);
      expect(body).not.toMatch(/password/i);
      expect(body).not.toMatch(/apiKey/i);
      expect(body).not.toMatch(/token/i);
    });
  });

  describe('GET /health with different methods', () => {
    test('should work with GET method', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
    });

    test('should reject POST method (typically)', async () => {
      const response = await request(app)
        .post('/health');

      // Most health endpoints only accept GET, expect 404 or 405
      expect([404, 405]).toContain(response.status);
    });
  });
});
