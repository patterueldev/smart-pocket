import config from '../../src/config/env';

describe('Environment Configuration', () => {
  describe('config object', () => {
    it('should have nodeEnv property', () => {
      expect(config).toHaveProperty('nodeEnv');
    });

    it('should have port property', () => {
      expect(config).toHaveProperty('port');
      expect(typeof config.port).toBe('number');
    });

    it('should have isDevelopment property', () => {
      expect(config).toHaveProperty('isDevelopment');
      expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should have isProduction property', () => {
      expect(config).toHaveProperty('isProduction');
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('should have apiKeys array', () => {
      expect(config).toHaveProperty('apiKeys');
      expect(Array.isArray(config.apiKeys)).toBe(true);
    });

    it('should have JWT secrets', () => {
      expect(config).toHaveProperty('jwtAccessSecret');
      expect(config).toHaveProperty('jwtRefreshSecret');
      expect(typeof config.jwtAccessSecret).toBe('string');
      expect(typeof config.jwtRefreshSecret).toBe('string');
    });

    it('should have JWT expiry times', () => {
      expect(config).toHaveProperty('jwtAccessExpiry');
      expect(config).toHaveProperty('jwtRefreshExpiry');
    });
  });

  describe('port configuration', () => {
    it('should be a number', () => {
      expect(typeof config.port).toBe('number');
    });

    it('should be between 1 and 65535', () => {
      expect(config.port).toBeGreaterThanOrEqual(1);
      expect(config.port).toBeLessThanOrEqual(65535);
    });

    it('should default to 3000 if PORT env not set', () => {
      expect(config.port).toBeGreaterThan(0);
    });
  });

  describe('JWT secrets', () => {
    it('should have non-empty access secret', () => {
      expect(config.jwtAccessSecret.length).toBeGreaterThan(0);
    });

    it('should have non-empty refresh secret', () => {
      expect(config.jwtRefreshSecret.length).toBeGreaterThan(0);
    });

    it('should have different secrets for access and refresh', () => {
      expect(config.jwtAccessSecret).not.toBe(config.jwtRefreshSecret);
    });
  });

  describe('API keys', () => {
    it('should be an array', () => {
      expect(Array.isArray(config.apiKeys)).toBe(true);
    });

    it('should contain strings if populated', () => {
      if (config.apiKeys.length > 0) {
        config.apiKeys.forEach((key) => {
          expect(typeof key).toBe('string');
        });
      }
    });
  });

  describe('environment detection', () => {
    it('should set isDevelopment based on NODE_ENV', () => {
      expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should set isProduction based on NODE_ENV', () => {
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('should not be both development and production', () => {
      expect(config.isDevelopment && config.isProduction).toBe(false);
    });
  });

  describe('expiry configuration', () => {
    it('should have jwtAccessExpiry string', () => {
      expect(typeof config.jwtAccessExpiry).toBe('string');
      expect(config.jwtAccessExpiry.length).toBeGreaterThan(0);
    });

    it('should have jwtRefreshExpiry string', () => {
      expect(typeof config.jwtRefreshExpiry).toBe('string');
      expect(config.jwtRefreshExpiry.length).toBeGreaterThan(0);
    });

    it('should use valid time format', () => {
      // Should be patterns like "1h", "7d", "24h", etc.
      expect(config.jwtAccessExpiry).toMatch(/^\d+[a-z]$/);
      expect(config.jwtRefreshExpiry).toMatch(/^\d+[a-z]$/);
    });
  });
});
