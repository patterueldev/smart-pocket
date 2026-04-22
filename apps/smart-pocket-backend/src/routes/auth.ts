import { Router, Request, Response } from 'express';
import AuthController from '../controllers/authController';
import { IAuthController } from '../interfaces';
import authMiddleware from '../middleware/authMiddleware';
import validateSetupRequest from '../middleware/validateSetupRequest';
import validateRefreshRequest from '../middleware/validateRefreshRequest';
import container from '../container';
import { IJwtService } from '../interfaces';
import { Logger } from '../utils/logger';

const router = Router();

// Get dependencies from container
const jwtService = container.get<IJwtService>('jwtService');
const logger = container.get<Logger>('logger');

// Instantiate controller with injected dependencies
const authController: IAuthController = new AuthController(jwtService, logger);

// Error handling wrapper for async handlers
const asyncHandler = (fn: (req: any, res: any) => Promise<void> | void) => (
  req: any,
  res: any,
  next: any
) => {
  Promise.resolve(fn(req, res)).catch(next);
};

// POST /auth/setup - Exchange API key for JWT tokens
router.post('/setup', validateSetupRequest, asyncHandler((req: Request, res: Response) => {
  authController.setup(req, res);
}));

// POST /auth/refresh - Refresh access token using refresh token
router.post('/refresh', validateRefreshRequest, asyncHandler((req: Request, res: Response) => {
  authController.refresh(req, res);
}));

// GET /auth/test - Protected endpoint for testing authentication
router.get('/test', authMiddleware, asyncHandler((req: Request, res: Response) => {
  authController.authTest(req, res);
}));

export default router;
