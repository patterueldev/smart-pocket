import config from '../../src/config/env';

describe('Environment Configuration Validation', () => {
  describe('Config Properties Exist', () => {
    it('should have nodeEnv property', () => {
      expect(config.nodeEnv).toBeDefined();
      expect(typeof config.nodeEnv).toBe('string');
    });

    it('should have port property as number', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
    });

    it('should have isDevelopment boolean flag', () => {
      expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should have isProduction boolean flag', () => {
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('should have apiKeys array', () => {
      expect(Array.isArray(config.apiKeys)).toBe(true);
    });

    it('should have jwtAccessSecret string', () => {
      expect(config.jwtAccessSecret).toBeDefined();
      expect(typeof config.jwtAccessSecret).toBe('string');
    });

    it('should have jwtRefreshSecret string', () => {
      expect(config.jwtRefreshSecret).toBeDefined();
      expect(typeof config.jwtRefreshSecret).toBe('string');
    });

    it('should have jwtAccessExpiry string', () => {
      expect(config.jwtAccessExpiry).toBeDefined();
      expect(typeof config.jwtAccessExpiry).toBe('string');
    });

    it('should have jwtRefreshExpiry string', () => {
      expect(config.jwtRefreshExpiry).toBeDefined();
      expect(typeof config.jwtRefreshExpiry).toBe('string');
    });
  });

  describe('Config Values Are Valid', () => {
    it('should have non-empty jwtAccessSecret', () => {
      expect(config.jwtAccessSecret.length).toBeGreaterThan(0);
    });

    it('should have non-empty jwtRefreshSecret', () => {
      expect(config.jwtRefreshSecret.length).toBeGreaterThan(0);
    });

    it('should have non-empty jwtAccessExpiry', () => {
      expect(config.jwtAccessExpiry.length).toBeGreaterThan(0);
    });

    it('should have non-empty jwtRefreshExpiry', () => {
      expect(config.jwtRefreshExpiry.length).toBeGreaterThan(0);
    });
  });

  describe('Config Consistency', () => {
    it('isDevelopment and isProduction should be booleans', () => {
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('port should be within valid range', () => {
      expect(config.port).toBeGreaterThanOrEqual(1);
      expect(config.port).toBeLessThanOrEqual(65535);
    });

    it('apiKeys should contain only strings', () => {
      config.apiKeys.forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });
  });
});
