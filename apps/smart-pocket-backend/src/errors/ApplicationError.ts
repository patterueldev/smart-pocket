/**
 * Custom Application Error class
 * Extends Error with HTTP status codes and error codes for structured error handling
 */
class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    Object.setPrototypeOf(this, ApplicationError.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApplicationError';
  }
}

export default ApplicationError;
export { ApplicationError };
