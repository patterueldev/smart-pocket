import HealthController from '../../src/controllers/healthController';

describe('HealthController', () => {
  let controller: HealthController;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    controller = new HealthController(mockLogger);
  });

  describe('check', () => {
    it('should return 200 status', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return success true', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include health message', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.message).toBeDefined();
      expect(typeof response.message).toBe('string');
    });

    it('should include ISO timestamp', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should log health check', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Health check requested');
    });

    it('should return valid response structure', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.check as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('timestamp');
    });
  });

  describe('Controller metadata', () => {
    it('should have name property', () => {
      expect(controller.name).toBeDefined();
      expect(typeof controller.name).toBe('string');
    });

    it('should include version in name', () => {
      expect(controller.name).toContain('v');
    });
  });
});
