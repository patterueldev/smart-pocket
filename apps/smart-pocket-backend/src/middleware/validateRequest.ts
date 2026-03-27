import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface ValidationError {
  field: string;
  message: string;
}

const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const messages: ValidationError[] = error.details.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    (req as any).validatedBody = value;
    next();
  };
};

export default validateRequest;
