import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validateRequest from '../../src/middleware/validateRequest';

describe('validateRequest Middleware', () => {
  describe('Valid Request', () => {
    it('should call next() with valid request body', () => {
      const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      const req = { body: { username: 'john', email: 'john@example.com' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect((req as any).validatedBody).toEqual({ username: 'john', email: 'john@example.com' });
    });

    it('should attach validated body to request', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const req = { body: { name: 'Alice', age: 25 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect((req as any).validatedBody).toBeDefined();
      expect((req as any).validatedBody.name).toBe('Alice');
      expect((req as any).validatedBody.age).toBe(25);
    });
  });

  describe('Invalid Request', () => {
    it('should return 400 with validation errors', () => {
      const schema = Joi.object({
        username: Joi.string().required(),
      });

      const req = { body: { username: '' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should not call next() on validation failure', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      const req = { body: { email: 'invalid-email' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should return error response with validation details', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      });

      const req = { body: { email: 'invalid', password: 'short' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.success).toBe(false);
      expect(callArgs.message).toBe('Validation failed');
      expect(callArgs.errors).toBeDefined();
      expect(Array.isArray(callArgs.errors)).toBe(true);
      expect(callArgs.errors.length).toBeGreaterThan(0);
    });

    it('should include error field and message in error details', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      const req = { body: { email: 'not-an-email' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.errors).toBeDefined();
      expect(response.errors[0]).toHaveProperty('field');
      expect(response.errors[0]).toHaveProperty('message');
      expect(response.errors[0].field).toBe('email');
    });

    it('should report multiple validation errors', () => {
      const schema = Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });

      const req = { body: { username: 'ab', email: 'invalid', age: 15 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject request without required field', () => {
      const schema = Joi.object({
        apiKey: Joi.string().required(),
        secret: Joi.string().required(),
      });

      const req = { body: { apiKey: 'key123' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should identify missing required field in error', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
      });

      const req = { body: { name: 'John' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.errors.some((e: any) => e.field === 'email')).toBe(true);
    });
  });

  describe('Empty Body', () => {
    it('should reject empty body when fields are required', () => {
      const schema = Joi.object({
        username: Joi.string().required(),
      });

      const req = { body: {} } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Type Validation', () => {
    it('should convert number fields correctly', () => {
      const schema = Joi.object({
        count: Joi.number().required(),
      });

      const req = { body: { count: 42 } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validatedBody.count).toBe(42);
    });

    it('should reject invalid type for field', () => {
      const schema = Joi.object({
        age: Joi.number().required(),
      });

      const req = { body: { age: 'not-a-number' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Complex Schemas', () => {
    it('should validate nested objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      });

      const req = {
        body: { user: { name: 'John', email: 'john@example.com' } },
      } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject nested object with invalid data', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      });

      const req = {
        body: { user: { name: 'John', email: 'invalid' } },
      } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Optional Fields', () => {
    it('should allow optional fields to be missing', () => {
      const schema = Joi.object({
        username: Joi.string().required(),
        phone: Joi.string().optional(),
      });

      const req = { body: { username: 'john' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate optional fields when provided', () => {
      const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().optional(),
      });

      const req = { body: { username: 'john', email: 'invalid' } } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
