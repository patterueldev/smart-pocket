import { Request, Response, NextFunction } from 'express';

export interface MockRequest extends Partial<Request> {
  body?: any;
  params?: any;
  headers?: any;
  validatedBody?: any;
}

export interface MockResponse extends Partial<Response> {
  statusCode?: number;
  data?: any;
  headers?: Record<string, string>;
}

/**
 * Create a mock Express Request object
 */
export const createMockRequest = (overrides: MockRequest = {}): MockRequest => ({
  body: overrides.body || {},
  params: overrides.params || {},
  headers: overrides.headers || {},
  validatedBody: overrides.validatedBody,
  ...overrides,
});

/**
 * Create a mock Express Response object with jest spy methods
 */
export const createMockResponse = (overrides: MockResponse = {}): MockResponse & { status: jest.Mock; json: jest.Mock; send: jest.Mock; setHeader: jest.Mock } => {
  const mockResponse: any = {
    statusCode: overrides.statusCode || 200,
    data: overrides.data,
    headers: overrides.headers || {},
    status: jest.fn(function (code: number) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (data: any) {
      this.data = data;
      return this;
    }),
    send: jest.fn(function (data: any) {
      this.data = data;
      return this;
    }),
    setHeader: jest.fn(function (key: string, value: string) {
      this.headers[key] = value;
      return this;
    }),
  };
  return mockResponse;
};

/**
 * Create a mock NextFunction for Express middleware testing
 */
export const createMockNextFunction = (): NextFunction => jest.fn();

/**
 * Get the JSON response data from a mock response
 */
export const getMockResponseData = (response: any): any => response.json.mock.calls[0]?.[0];

/**
 * Get the status code from a mock response
 */
export const getMockResponseStatus = (response: any): number => response.statusCode;

/**
 * Assert that response.status() was called with a specific code
 */
export const expectStatusCode = (response: any, expectedCode: number): void => {
  expect(response.status).toHaveBeenCalledWith(expectedCode);
};

/**
 * Assert that response.json() was called with data matching a predicate
 */
export const expectJsonResponse = (response: any, matcher: (data: any) => boolean): void => {
  const data = getMockResponseData(response);
  expect(matcher(data)).toBe(true);
};
