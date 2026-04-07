import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import container from '../container';
import { Logger } from '../utils/logger';
import { RefreshRequest } from '../models';

interface ValidatedRequest extends Request {
  validatedBody?: RefreshRequest;
}

const logger = container.get<Logger>('logger');

const validateRefreshRequest = (req: ValidatedRequest, res: Response, next: NextFunction): void => {
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

  req.validatedBody = value as RefreshRequest;
  next();
};

export default validateRefreshRequest;
