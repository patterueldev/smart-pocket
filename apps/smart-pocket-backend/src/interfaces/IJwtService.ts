import { TokenPayload, AccessTokenResponse } from '../models';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IJwtService {
  /**
   * Generate access and refresh tokens for an API key
   */
  generateTokens(apiKey: string): ITokens;

  /**
   * Verify access token and return payload
   */
  verifyAccessToken(token: string): TokenPayload | null;

  /**
   * Verify refresh token and return payload
   */
  verifyRefreshToken(token: string): TokenPayload | null;

  /**
   * Generate new access token from refresh token
   */
  refreshAccessToken(refreshToken: string): AccessTokenResponse | null;
}
