import { IJwtService, ITokens } from '../../src/interfaces';
import { TokenPayload, AccessTokenResponse } from '../../src/models';

export const mockJwtService: jest.Mocked<IJwtService> = {
  generateTokens: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  refreshAccessToken: jest.fn(),
};

export const createDefaultTokens = (apiKey = 'test-api-key'): ITokens => ({
  accessToken: 'test.access.token',
  refreshToken: 'test.refresh.token',
  expiresIn: 3600,
});

export const createDefaultTokenPayload = (apiKey = 'test-api-key'): TokenPayload => ({
  apiKey,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
});

export const createAccessTokenResponse = (): AccessTokenResponse => ({
  success: true,
  accessToken: 'test.access.token',
});
