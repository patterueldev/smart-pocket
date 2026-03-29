import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import container from '../container';
import { Logger } from '../utils/logger';
import { SetupRequest } from '../models';

interface ValidatedRequest extends Request {
  validatedBody?: SetupRequest;
}

const logger = container.get<Logger>('logger');

const validateSetupRequest = (req: ValidatedRequest, res: Response, next: NextFunction): void => {
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

  req.validatedBody = value as SetupRequest;
  next();
};

export default validateSetupRequest;
