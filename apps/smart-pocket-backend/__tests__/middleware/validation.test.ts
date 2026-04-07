import validateSetupRequest from '../../src/middleware/validateSetupRequest';
import validateRefreshRequest from '../../src/middleware/validateRefreshRequest';

jest.mock('../../src/container', () => ({
  get: jest.fn((serviceName) => {
    if (serviceName === 'logger') {
      return {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
      };
    }
    return {};
  }),
}));

describe('Validation Middleware', () => {
  describe('validateSetupRequest', () => {
    it('should pass valid setup request', () => {
      const req = { body: { apiKey: 'valid-api-key' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateSetupRequest as any)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validatedBody).toEqual({ apiKey: 'valid-api-key' });
    });

    it('should reject setup request without apiKey', () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateSetupRequest as any)(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return error response for invalid data', () => {
      const req = { body: { apiKey: '' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateSetupRequest as any)(req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toBeDefined();
    });

    it('should handle long apiKey', () => {
      const longKey = 'a'.repeat(100);
      const req = { body: { apiKey: longKey } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateSetupRequest as any)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validatedBody.apiKey).toBe(longKey);
    });
  });

  describe('validateRefreshRequest', () => {
    it('should pass valid refresh request', () => {
      const req = { body: { refreshToken: 'valid.refresh.token' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validatedBody).toEqual({ refreshToken: 'valid.refresh.token' });
    });

    it('should reject refresh request without token', () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should attach validated body to request', () => {
      const token = 'test.refresh.token';
      const req = { body: { refreshToken: token } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      expect((req as any).validatedBody).toEqual({ refreshToken: token });
    });

    it('should return error for missing refreshToken', () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('refreshToken');
    });

    it('should return 400 status on validation error', () => {
      const req = { body: { refreshToken: null } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should not call next on validation failure', () => {
      const req = { body: { refreshToken: '' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      (validateRefreshRequest as any)(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });
});
