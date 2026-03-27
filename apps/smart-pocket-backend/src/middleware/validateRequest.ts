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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validatedReq = req as any;
    validatedReq.validatedBody = value;
    next();
  };
};

export default validateRequest;
