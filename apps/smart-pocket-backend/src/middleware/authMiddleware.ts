import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/JwtService';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  apiKey?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header', {
      path: req.path,
      method: req.method,
    });
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Authorization header',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = jwtService.verifyAccessToken(token);

  if (!payload) {
    logger.warn('Invalid or expired access token', {
      path: req.path,
      method: req.method,
    });
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired access token',
    });
    return;
  }

  req.apiKey = payload.apiKey;
  logger.info('Authenticated request', {
    path: req.path,
    method: req.method,
    apiKey: payload.apiKey.substring(0, 10) + '***',
  });

  next();
};

export default authMiddleware;
