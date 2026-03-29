/**
 * Jest setup file for mobile tests
 * Initializes mocks and test utilities
 */

// Mock axios FIRST before anything else
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  create: jest.fn(function() {
    return {
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
  }),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

// Mock Expo Secure Store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (key: string, value: string) => value),
  getItemAsync: jest.fn(async (key: string) => null),
  deleteItemAsync: jest.fn(async (key: string) => undefined),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useRootNavigationState: () => ({
    key: 'root',
  }),
}));

// Suppress console errors/warnings in tests unless needed
global.console.error = jest.fn();
global.console.warn = jest.fn();

