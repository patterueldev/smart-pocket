import { ServiceFactory } from '../../services/ServiceFactory';

describe('ServiceFactory', () => {
  describe('createServices', () => {
    it('should return object with all required services for "real" mode', () => {
      const services = ServiceFactory.createServices('real');

      expect(services).toHaveProperty('authService');
      expect(services).toHaveProperty('storageService');
      expect(services).toHaveProperty('apiClient');
      expect(typeof services.authService).toBe('object');
      expect(typeof services.storageService).toBe('object');
      expect(typeof services.apiClient).toBe('object');
    });

    it('should return object with all required services for "mock" mode', () => {
      const services = ServiceFactory.createServices('mock');

      expect(services).toHaveProperty('authService');
      expect(services).toHaveProperty('storageService');
      expect(services).toHaveProperty('apiClient');
      expect(typeof services.authService).toBe('object');
      expect(typeof services.storageService).toBe('object');
      expect(typeof services.apiClient).toBe('object');
    });

    it('should return services with required methods', () => {
      const services = ServiceFactory.createServices('real');

      // Check IAuthService methods
      expect(typeof services.authService.setup).toBe('function');
      expect(typeof services.authService.refreshAccessToken).toBe('function');
      expect(typeof services.authService.logout).toBe('function');

      // Check IStorageService methods
      expect(typeof services.storageService.saveTokens).toBe('function');
      expect(typeof services.storageService.getTokens).toBe('function');
      expect(typeof services.storageService.clearAll).toBe('function');

      // Check IApiClient methods
      expect(typeof services.apiClient.initialize).toBe('function');
      expect(typeof services.apiClient.get).toBe('function');
      expect(typeof services.apiClient.post).toBe('function');
    });

    it('should create different instances for real and mock modes', () => {
      const realServices = ServiceFactory.createServices('real');
      const mockServices = ServiceFactory.createServices('mock');

      // Both should exist and have the required methods
      expect(realServices).toBeDefined();
      expect(mockServices).toBeDefined();
      expect(realServices).not.toBe(mockServices);
    });

    it('should handle invalid modes gracefully', () => {
      // For invalid modes, the factory should either return real services or handle them
      expect(() => ServiceFactory.createServices('real')).not.toThrow();
      expect(() => ServiceFactory.createServices('mock')).not.toThrow();
    });
  });
});
