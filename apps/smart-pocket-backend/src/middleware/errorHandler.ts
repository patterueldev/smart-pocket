import { Request, Response, NextFunction } from 'express';
import container from '../container';
import { Logger } from '../utils/logger';

interface CustomError extends Error {
  status?: number;
}

const logger = container.get<Logger>('logger');

class ErrorHandler {
  handle(err: CustomError, _req: Request, res: Response, _next: NextFunction): void {
    logger.error('Request error', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
      success: false,
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
}

export default new ErrorHandler();
