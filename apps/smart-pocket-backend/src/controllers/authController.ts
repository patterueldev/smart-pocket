import { Request, Response } from 'express';
import config from '../config/env';
import jwtService from '../services/JwtService';
import logger from '../utils/logger';
import Joi from 'joi';
import { SetupRequest, RefreshRequest, TokenResponse, AuthTestResponse } from '../models';
import { IAuthController, AuthRequest } from '../interfaces/IAuthController';

class AuthController implements IAuthController {
  name: string = 'AuthController';

  /**
   * POST /auth/setup
   * Exchange API key for JWT tokens
   */
  setup(req: Request, res: Response<TokenResponse>): void {
    const schema = Joi.object({
      apiKey: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      logger.warn('Invalid setup request', { error: error.message });
      res.status(400).json({
        success: false,
        message: `Invalid request: ${error.details[0].message}`,
      });
      return;
    }

    const { apiKey } = value as SetupRequest;

    if (!config.apiKeys.includes(apiKey)) {
      logger.warn('Invalid API key in setup', {
        keyLength: apiKey.length,
      });
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid API key',
      });
      return;
    }

    const tokens = jwtService.generateTokens(apiKey);

    logger.info('Tokens issued', {
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
   */
  refresh(req: Request, res: Response<TokenResponse>): void {
    const schema = Joi.object({
      refreshToken: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      logger.warn('Invalid refresh request', { error: error.message });
      res.status(400).json({
        success: false,
        message: `Invalid request: ${error.details[0].message}`,
      });
      return;
    }

    const { refreshToken } = value as RefreshRequest;
    const result = jwtService.refreshAccessToken(refreshToken);

    if (!result) {
      logger.warn('Invalid or expired refresh token');
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired refresh token',
      });
      return;
    }

    logger.info('Access token refreshed');

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
