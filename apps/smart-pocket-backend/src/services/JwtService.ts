import jwt from 'jsonwebtoken';
import config from '../config/env';
import { IJwtService, ITokens } from '../interfaces';
import { TokenPayload, AccessTokenResponse } from '../models';

class JwtService implements IJwtService {
  /**
   * Generate access and refresh tokens for an API key
   */
  generateTokens(apiKey: string): ITokens {
    const accessExpiresIn = '1h';
    const refreshExpiresIn = '7d';

    const accessToken = jwt.sign({ apiKey }, config.jwtAccessSecret, {
      expiresIn: accessExpiresIn,
    });

    const refreshToken = jwt.sign({ apiKey }, config.jwtRefreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    // Access token expires in 3600 seconds (1 hour)
    const expiresIn = 3600;

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify access token and return payload
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.jwtAccessSecret);
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verify refresh token and return payload
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.jwtRefreshSecret);
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate new access token from refresh token
   */
  refreshAccessToken(refreshToken: string): AccessTokenResponse | null {
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      return null;
    }

    const newAccessToken = jwt.sign({ apiKey: payload.apiKey }, config.jwtAccessSecret, {
      expiresIn: '1h',
    });

    return {
      success: true,
      accessToken: newAccessToken,
    };
  }
}

export default new JwtService();
export { JwtService };
