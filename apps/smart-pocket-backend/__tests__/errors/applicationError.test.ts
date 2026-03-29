import ApplicationError from '../../src/errors/ApplicationError';
import ErrorCodes from '../../src/errors/errorCodes';

describe('ApplicationError', () => {
  describe('constructor', () => {
    it('should create error with status code and message', () => {
      const error = new ApplicationError(400, 'Bad request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
    });

    it('should create error with optional code', () => {
      const error = new ApplicationError(401, 'Unauthorized', ErrorCodes.INVALID_API_KEY);

      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    });

    it('should set name to ApplicationError', () => {
      const error = new ApplicationError(500, 'Server error');

      expect(error.name).toBe('ApplicationError');
    });

    it('should inherit from Error', () => {
      const error = new ApplicationError(400, 'Bad request');

      expect(error instanceof Error).toBe(true);
    });

    it('should have stack trace', () => {
      const error = new ApplicationError(400, 'Bad request');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApplicationError');
    });
  });

  describe('HTTP status codes', () => {
    it('should support 400 Bad Request', () => {
      const error = new ApplicationError(400, 'Bad request');
      expect(error.statusCode).toBe(400);
    });

    it('should support 401 Unauthorized', () => {
      const error = new ApplicationError(401, 'Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('should support 403 Forbidden', () => {
      const error = new ApplicationError(403, 'Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should support 404 Not Found', () => {
      const error = new ApplicationError(404, 'Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should support 500 Internal Server Error', () => {
      const error = new ApplicationError(500, 'Server error');
      expect(error.statusCode).toBe(500);
    });

    it('should support 503 Service Unavailable', () => {
      const error = new ApplicationError(503, 'Service unavailable');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('Error codes', () => {
    it('should work with INVALID_API_KEY', () => {
      const error = new ApplicationError(401, 'Invalid API key', ErrorCodes.INVALID_API_KEY);
      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    });

    it('should work with VALIDATION_ERROR', () => {
      const error = new ApplicationError(400, 'Validation failed', ErrorCodes.VALIDATION_ERROR);
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should work with INTERNAL_SERVER_ERROR', () => {
      const error = new ApplicationError(500, 'Server error', ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(error.code).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('throwability', () => {
    it('should be throwable and catchable', () => {
      expect(() => {
        throw new ApplicationError(400, 'Test error');
      }).toThrow(ApplicationError);
    });

    it('should preserve properties when thrown', () => {
      try {
        throw new ApplicationError(403, 'Forbidden', 'FORBIDDEN_CODE');
      } catch (error) {
        expect((error as ApplicationError).statusCode).toBe(403);
        expect((error as ApplicationError).message).toBe('Forbidden');
        expect((error as ApplicationError).code).toBe('FORBIDDEN_CODE');
      }
    });

    it('should work with catch as Error', () => {
      try {
        throw new ApplicationError(500, 'Server error');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof ApplicationError).toBe(true);
      }
    });
  });
});

describe('ErrorCodes', () => {
  describe('error code constants', () => {
    it('should define authentication error codes', () => {
      expect(ErrorCodes.INVALID_API_KEY).toBeDefined();
      expect(ErrorCodes.MISSING_AUTH_HEADER).toBeDefined();
      expect(ErrorCodes.INVALID_AUTH_HEADER).toBeDefined();
      expect(ErrorCodes.INVALID_ACCESS_TOKEN).toBeDefined();
      expect(ErrorCodes.EXPIRED_ACCESS_TOKEN).toBeDefined();
      expect(ErrorCodes.INVALID_REFRESH_TOKEN).toBeDefined();
      expect(ErrorCodes.EXPIRED_REFRESH_TOKEN).toBeDefined();
    });

    it('should define validation error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBeDefined();
      expect(ErrorCodes.INVALID_REQUEST_BODY).toBeDefined();
      expect(ErrorCodes.MISSING_REQUIRED_FIELD).toBeDefined();
    });

    it('should define resource error codes', () => {
      expect(ErrorCodes.NOT_FOUND).toBeDefined();
      expect(ErrorCodes.RESOURCE_NOT_FOUND).toBeDefined();
    });

    it('should define server error codes', () => {
      expect(ErrorCodes.INTERNAL_SERVER_ERROR).toBeDefined();
      expect(ErrorCodes.SERVICE_UNAVAILABLE).toBeDefined();
      expect(ErrorCodes.DATABASE_ERROR).toBeDefined();
    });
  });

  describe('error code values', () => {
    it('should have string values', () => {
      Object.values(ErrorCodes).forEach((code) => {
        expect(typeof code).toBe('string');
      });
    });

    it('should use uppercase naming convention', () => {
      Object.entries(ErrorCodes).forEach(([key, value]) => {
        expect(value).toMatch(/^[A-Z_]+$/);
      });
    });
  });

  describe('error code usage', () => {
    it('should work with ApplicationError', () => {
      const error = new ApplicationError(401, 'Not authenticated', ErrorCodes.INVALID_API_KEY);
      expect(error.code).toBe(ErrorCodes.INVALID_API_KEY);
    });

    it('should support different error codes for similar scenarios', () => {
      const error1 = new ApplicationError(401, 'msg', ErrorCodes.INVALID_API_KEY);
      const error2 = new ApplicationError(401, 'msg', ErrorCodes.MISSING_AUTH_HEADER);

      expect(error1.code).not.toBe(error2.code);
    });

    it('should have all codes as distinct constants', () => {
      const codes = Object.values(ErrorCodes);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
