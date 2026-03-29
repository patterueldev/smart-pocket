import { Router, Request, Response } from 'express';
import AuthController from '../controllers/authController';
import { IAuthController } from '../interfaces';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const authController: IAuthController = new AuthController();

// POST /auth/setup - Exchange API key for JWT tokens
router.post('/setup', (req: Request, res: Response) => {
  authController.setup(req, res);
});

// POST /auth/refresh - Refresh access token using refresh token
router.post('/refresh', (req: Request, res: Response) => {
  authController.refresh(req, res);
});

// GET /auth/test - Protected endpoint for testing authentication
router.get('/test', authMiddleware, (req: Request, res: Response) => {
  authController.authTest(req, res);
});

export default router;
