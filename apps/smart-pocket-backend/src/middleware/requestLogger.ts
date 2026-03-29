import { Request, Response, NextFunction } from 'express';
import container from '../container';
import { Logger } from '../utils/logger';

const logger = container.get<Logger>('logger');

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export default requestLogger;
