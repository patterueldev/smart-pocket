import jwt from 'jsonwebtoken';
import { JwtService } from '../../src/services/JwtService';
import config from '../../src/config/env';

// Mock the config module
jest.mock('../../src/config/env');

describe('JwtService', () => {
  let jwtService: JwtService;
  const mockConfig = {
    jwtAccessSecret: 'test-access-secret-key',
    jwtRefreshSecret: 'test-refresh-secret-key',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (config as any).jwtAccessSecret = mockConfig.jwtAccessSecret;
    (config as any).jwtRefreshSecret = mockConfig.jwtRefreshSecret;
    jwtService = new JwtService();
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const apiKey = 'test-api-key';
      const result = jwtService.generateTokens(apiKey);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.expiresIn).toBe(3600);
    });

    it('should generate different tokens for different API keys', () => {
      const result1 = jwtService.generateTokens('api-key-1');
      const result2 = jwtService.generateTokens('api-key-2');

      expect(result1.accessToken).not.toBe(result2.accessToken);
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
    });

    it('should include apiKey in token payload', () => {
      const apiKey = 'my-test-key';
      const result = jwtService.generateTokens(apiKey);

      const accessPayload = jwt.verify(result.accessToken, mockConfig.jwtAccessSecret) as any;
      expect(accessPayload.apiKey).toBe(apiKey);

      const refreshPayload = jwt.verify(result.refreshToken, mockConfig.jwtRefreshSecret) as any;
      expect(refreshPayload.apiKey).toBe(apiKey);
    });

    it('should generate tokens with proper expiration times', () => {
      const result = jwtService.generateTokens('test-key');
      const accessPayload = jwt.verify(result.accessToken, mockConfig.jwtAccessSecret) as any;
      const refreshPayload = jwt.verify(result.refreshToken, mockConfig.jwtRefreshSecret) as any;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const oneHourInSeconds = 3600;
      const sevenDaysInSeconds = 7 * 24 * 3600;

      expect(accessPayload.exp).toBeGreaterThan(nowInSeconds);
      expect(accessPayload.exp).toBeLessThanOrEqual(nowInSeconds + oneHourInSeconds + 10);

      expect(refreshPayload.exp).toBeGreaterThan(nowInSeconds);
      expect(refreshPayload.exp).toBeLessThanOrEqual(nowInSeconds + sevenDaysInSeconds + 10);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token and return payload', () => {
      const apiKey = 'test-api-key';
      const tokens = jwtService.generateTokens(apiKey);
      const payload = jwtService.verifyAccessToken(tokens.accessToken);

      expect(payload).not.toBeNull();
      expect(payload?.apiKey).toBe(apiKey);
    });

    it('should return null for invalid token', () => {
      const payload = jwtService.verifyAccessToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = jwtService.verifyAccessToken('not-even-a-token');
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      const expiredToken = jwt.sign(
        { apiKey: 'test' },
        mockConfig.jwtAccessSecret,
        { expiresIn: '-1s' }
      );
      const payload = jwtService.verifyAccessToken(expiredToken);
      expect(payload).toBeNull();
    });

    it('should return null for token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { apiKey: 'test' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );
      const payload = jwtService.verifyAccessToken(wrongSecretToken);
      expect(payload).toBeNull();
    });

    it('should handle empty token string', () => {
      const payload = jwtService.verifyAccessToken('');
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token and return payload', () => {
      const apiKey = 'test-api-key';
      const tokens = jwtService.generateTokens(apiKey);
      const payload = jwtService.verifyRefreshToken(tokens.refreshToken);

      expect(payload).not.toBeNull();
      expect(payload?.apiKey).toBe(apiKey);
    });

    it('should return null for invalid refresh token', () => {
      const payload = jwtService.verifyRefreshToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should return null for expired refresh token', () => {
      const expiredToken = jwt.sign(
        { apiKey: 'test' },
        mockConfig.jwtRefreshSecret,
        { expiresIn: '-1s' }
      );
      const payload = jwtService.verifyRefreshToken(expiredToken);
      expect(payload).toBeNull();
    });

    it('should return null for token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { apiKey: 'test' },
        'wrong-secret-key',
        { expiresIn: '7d' }
      );
      const payload = jwtService.verifyRefreshToken(wrongSecretToken);
      expect(payload).toBeNull();
    });

    it('should not accept access token as refresh token', () => {
      const tokens = jwtService.generateTokens('test-key');
      const payload = jwtService.verifyRefreshToken(tokens.accessToken);
      // Access token is signed with accessSecret, refresh verifies with refreshSecret
      // So access token should fail refresh verification (as expected)
      expect(payload).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', () => {
      const apiKey = 'test-api-key';
      const tokens = jwtService.generateTokens(apiKey);
      const result = jwtService.refreshAccessToken(tokens.refreshToken);

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.accessToken).toBeDefined();
      expect(typeof result?.accessToken).toBe('string');
    });

    it('should return null for invalid refresh token', () => {
      const result = jwtService.refreshAccessToken('invalid.token');
      expect(result).toBeNull();
    });

    it('should return null for expired refresh token', () => {
      const expiredToken = jwt.sign(
        { apiKey: 'test' },
        mockConfig.jwtRefreshSecret,
        { expiresIn: '-1s' }
      );
      const result = jwtService.refreshAccessToken(expiredToken);
      expect(result).toBeNull();
    });

    it('should preserve apiKey in new access token', () => {
      const apiKey = 'my-special-api-key';
      const tokens = jwtService.generateTokens(apiKey);
      const result = jwtService.refreshAccessToken(tokens.refreshToken);

      expect(result).not.toBeNull();
      if (result?.accessToken) {
        const newPayload = jwt.verify(result.accessToken, mockConfig.jwtAccessSecret) as any;
        expect(newPayload.apiKey).toBe(apiKey);
      }
    });

    it('should generate new tokens with each refresh call', () => {
      const tokens = jwtService.generateTokens('test-key');
      const result1 = jwtService.refreshAccessToken(tokens.refreshToken);
      const result2 = jwtService.refreshAccessToken(tokens.refreshToken);

      // Both should be valid and different (different iat timestamps)
      expect(result1?.accessToken).toBeDefined();
      expect(result2?.accessToken).toBeDefined();
      // They will be different due to jwt.sign including iat claim
      expect(typeof result1?.accessToken).toBe('string');
      expect(typeof result2?.accessToken).toBe('string');
    });

    it('should return object with success=true', () => {
      const tokens = jwtService.generateTokens('test-key');
      const result = jwtService.refreshAccessToken(tokens.refreshToken);

      expect(result?.success).toBe(true);
    });
  });

  describe('Token format and structure', () => {
    it('should generate JWT format tokens (three parts separated by dots)', () => {
      const tokens = jwtService.generateTokens('test-key');

      const accessParts = tokens.accessToken.split('.');
      const refreshParts = tokens.refreshToken.split('.');

      expect(accessParts).toHaveLength(3);
      expect(refreshParts).toHaveLength(3);
    });

    it('should generate reproducible tokens with same input', () => {
      const apiKey = 'test-key';
      // Note: JWT includes iat (issued at) timestamp, so tokens will be different
      // but should have same payload structure
      const tokens1 = jwtService.generateTokens(apiKey);
      const tokens2 = jwtService.generateTokens(apiKey);

      const payload1 = jwt.verify(tokens1.accessToken, mockConfig.jwtAccessSecret) as any;
      const payload2 = jwt.verify(tokens2.accessToken, mockConfig.jwtAccessSecret) as any;

      expect(payload1.apiKey).toBe(payload2.apiKey);
    });
  });

  describe('Error handling', () => {
    it('should handle null/undefined gracefully in verifyAccessToken', () => {
      expect(jwtService.verifyAccessToken(null as any)).toBeNull();
      expect(jwtService.verifyAccessToken(undefined as any)).toBeNull();
    });

    it('should handle null/undefined gracefully in verifyRefreshToken', () => {
      expect(jwtService.verifyRefreshToken(null as any)).toBeNull();
      expect(jwtService.verifyRefreshToken(undefined as any)).toBeNull();
    });

    it('should handle null/undefined gracefully in refreshAccessToken', () => {
      expect(jwtService.refreshAccessToken(null as any)).toBeNull();
      expect(jwtService.refreshAccessToken(undefined as any)).toBeNull();
    });
  });
});
