import AuthController from '../../src/controllers/authController';
import { IJwtService } from '../../src/interfaces';
import config from '../../src/config/env';

jest.mock('../../src/config/env');

describe('AuthController', () => {
  let controller: AuthController;
  let mockJwtService: jest.Mocked<IJwtService>;
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      refreshAccessToken: jest.fn(),
    };
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    (config as any).apiKeys = ['test-api-key', 'another-key'];
    controller = new AuthController(mockJwtService, mockLogger);
  });

  describe('setup', () => {
    it('should issue tokens for valid API key', () => {
      const tokens = {
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        expiresIn: 3600,
      };
      mockJwtService.generateTokens.mockReturnValue(tokens);

      const req = {
        validatedBody: { apiKey: 'test-api-key' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.setup as any)(req, res);

      expect(mockJwtService.generateTokens).toHaveBeenCalledWith('test-api-key');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      });
    });

    it('should reject invalid API key', () => {
      const req = {
        validatedBody: { apiKey: 'invalid-key' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.setup as any)(req, res);

      expect(mockJwtService.generateTokens).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Invalid API key');
    });

    it('should log token issuance', () => {
      mockJwtService.generateTokens.mockReturnValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const req = { validatedBody: { apiKey: 'test-api-key' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.setup as any)(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Tokens issued',
        expect.any(Object)
      );
    });

    it('should log invalid API key attempts', () => {
      const req = { validatedBody: { apiKey: 'invalid-key' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.setup as any)(req, res);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid API key in setup',
        expect.any(Object)
      );
    });

    it('should work with multiple valid API keys', () => {
      mockJwtService.generateTokens.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const req = { validatedBody: { apiKey: 'another-key' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.setup as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockJwtService.generateTokens).toHaveBeenCalledWith('another-key');
    });
  });

  describe('refresh', () => {
    it('should refresh access token with valid refresh token', () => {
      mockJwtService.refreshAccessToken.mockReturnValue({
        success: true,
        accessToken: 'new.access.token',
      });

      const req = {
        validatedBody: { refreshToken: 'valid.refresh.token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.refresh as any)(req, res);

      expect(mockJwtService.refreshAccessToken).toHaveBeenCalledWith('valid.refresh.token');
      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.accessToken).toBe('new.access.token');
    });

    it('should reject invalid refresh token', () => {
      mockJwtService.refreshAccessToken.mockReturnValue(null);

      const req = {
        validatedBody: { refreshToken: 'invalid.token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.refresh as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Invalid or expired refresh token');
    });

    it('should reject expired refresh token', () => {
      mockJwtService.refreshAccessToken.mockReturnValue(null);

      const req = {
        validatedBody: { refreshToken: 'expired.token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.refresh as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should log token refresh', () => {
      mockJwtService.refreshAccessToken.mockReturnValue({
        success: true,
        accessToken: 'new.token',
      });

      const req = { validatedBody: { refreshToken: 'refresh.token' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.refresh as any)(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Access token refreshed');
    });

    it('should log invalid refresh token attempts', () => {
      mockJwtService.refreshAccessToken.mockReturnValue(null);

      const req = { validatedBody: { refreshToken: 'invalid' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.refresh as any)(req, res);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid or expired refresh token'
      );
    });
  });

  describe('authTest', () => {
    it('should return success for authenticated request', () => {
      const req = { apiKey: 'test-api-key' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.authTest as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.message).toBe('Authentication successful');
    });

    it('should include apiKey in response', () => {
      const req = { apiKey: 'my-api-key' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.authTest as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.authenticatedAs).toBe('my-api-key');
    });

    it('should include timestamp in response', () => {
      const req = { apiKey: 'test-key' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.authTest as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe('string');
      // Valid ISO timestamp
      expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should handle missing apiKey gracefully', () => {
      const req = { apiKey: undefined };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.authTest as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.authenticatedAs).toBe('unknown');
    });

    it('should always return HTTP 200', () => {
      const req = { apiKey: 'any-key' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (controller.authTest as any)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Controller name', () => {
    it('should have correct name property', () => {
      expect(controller.name).toBe('AuthController');
    });
  });

  describe('Response formats', () => {
    it('should return consistent response structure in setup', () => {
      mockJwtService.generateTokens.mockReturnValue({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 3600,
      });

      const req = { validatedBody: { apiKey: 'test-api-key' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.setup as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
      expect(response).toHaveProperty('expiresIn');
    });

    it('should return consistent response structure in refresh', () => {
      mockJwtService.refreshAccessToken.mockReturnValue({
        success: true,
        accessToken: 'new.token',
      });

      const req = { validatedBody: { refreshToken: 'token' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.refresh as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('accessToken');
    });

    it('should return consistent response structure in authTest', () => {
      const req = { apiKey: 'key' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      (controller.authTest as any)(req, res);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('authenticatedAs');
      expect(response).toHaveProperty('timestamp');
    });
  });
});
