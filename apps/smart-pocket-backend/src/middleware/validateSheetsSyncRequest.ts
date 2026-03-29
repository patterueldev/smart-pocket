import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const createDraftSchema = Joi.object({
  actualBudgetServerUrl: Joi.string().uri().optional(),
  actualBudgetPassword: Joi.string().optional(),
  actualBudgetId: Joi.string().optional(),
});

const executeSyncSchema = Joi.object({
  draftId: Joi.string().required(),
});

export function validateCreateDraftRequest(req: Request, res: Response, next: NextFunction): void {
  const { error, value } = createDraftSchema.validate(req.body || {});

  if (error) {
    res.status(400).json({
      success: false,
      message: `Validation error: ${error.message}`,
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return;
  }

  req.body = value;
  next();
}

export function validateExecuteSyncRequest(req: Request, res: Response, next: NextFunction): void {
  const { error, value } = executeSyncSchema.validate(req.body || {});

  if (error) {
    res.status(400).json({
      success: false,
      message: `Validation error: ${error.message}`,
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return;
  }

  req.body = value;
  next();
}
