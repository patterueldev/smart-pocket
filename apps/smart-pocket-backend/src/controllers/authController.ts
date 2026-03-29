import { Request, Response } from 'express';
import config from '../config/env';
import { SetupRequest, RefreshRequest, TokenResponse, AuthTestResponse } from '../models';
import { IAuthController, AuthRequest } from '../interfaces/IAuthController';
import { IJwtService } from '../interfaces';
import { Logger } from '../utils/logger';

interface ValidatedRequest extends Request {
  validatedBody?: SetupRequest | RefreshRequest;
}

class AuthController implements IAuthController {
  name: string = 'AuthController';

  constructor(
    private jwtService: IJwtService,
    private logger: Logger
  ) {}

  /**
   * POST /auth/setup
   * Exchange API key for JWT tokens
   * (Validation handled by validateSetupRequest middleware)
   */
  setup(req: ValidatedRequest, res: Response<TokenResponse>): void {
    const { apiKey } = req.validatedBody as SetupRequest;

    if (!config.apiKeys.includes(apiKey)) {
      this.logger.warn('Invalid API key in setup', {
        keyLength: apiKey.length,
      });
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid API key',
      });
      return;
    }

    const tokens = this.jwtService.generateTokens(apiKey);

    this.logger.info('Tokens issued', {
      apiKeyPrefix: apiKey.substring(0, 5) + '***',
    });

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   * (Validation handled by validateRefreshRequest middleware)
   */
  refresh(req: ValidatedRequest, res: Response<TokenResponse>): void {
    const { refreshToken } = req.validatedBody as RefreshRequest;
    const result = this.jwtService.refreshAccessToken(refreshToken);

    if (!result) {
      this.logger.warn('Invalid or expired refresh token');
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired refresh token',
      });
      return;
    }

    this.logger.info('Access token refreshed');

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  }

  /**
   * GET /auth/test
   * Protected endpoint to test authentication
   */
  authTest(req: AuthRequest, res: Response<AuthTestResponse>): void {
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      authenticatedAs: req.apiKey || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
}

export default AuthController;
