import config from '../../src/config/env';

export const createMockConfig = (overrides: Partial<typeof config> = {}) => ({
  nodeEnv: 'test',
  port: 3000,
  isDevelopment: false,
  isProduction: false,
  apiKeys: ['test-api-key'],
  jwtAccessSecret: 'test-access-secret',
  jwtRefreshSecret: 'test-refresh-secret',
  jwtAccessExpiry: '1h',
  jwtRefreshExpiry: '7d',
  ...overrides,
});

export const mockConfig = createMockConfig();
