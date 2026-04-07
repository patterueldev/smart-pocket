import { Request, Response } from 'express';
import { TokenResponse, AuthTestResponse } from '../models';

interface AuthRequest extends Request {
  apiKey?: string;
}

/**
 * Interface Segregation Principle (ISP):
 * Each controller method is segregated - clients only depend on what they use
 */
export interface IAuthController {
  /**
   * Exchange API key for JWT tokens
   * POST /auth/setup
   */
  setup(req: Request, res: Response<TokenResponse>): void;

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   */
  refresh(req: Request, res: Response<TokenResponse>): void;

  /**
   * Protected endpoint to test authentication
   * GET /auth/test
   */
  authTest(req: AuthRequest, res: Response<AuthTestResponse>): void;
}

export type { AuthRequest };
