import { ServiceFactory } from '@/services/ServiceFactory';
import { IAuthService } from '@/services/auth';
import { IStorageService } from '@/services/storage';
import { IApiClient } from '@/services/api';
import { ISheetsSync } from '@/services/sheets-sync/ISheetsSync';

describe('ServiceFactory', () => {
  describe('createServices', () => {
    it('should create all services in mock mode', () => {
      const services = ServiceFactory.createServices('mock');

      expect(services).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.storageService).toBeDefined();
      expect(services.apiClient).toBeDefined();
      expect(services.sheetsSync).toBeDefined();
    });

    it('should create all services in real mode', () => {
      const services = ServiceFactory.createServices('real');

      expect(services).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.storageService).toBeDefined();
      expect(services.apiClient).toBeDefined();
      expect(services.sheetsSync).toBeDefined();
    });

    it('should use mock mode by default', () => {
      const services = ServiceFactory.createServices();

      expect(services).toBeDefined();
      expect(services.authService).toBeDefined();
      expect(services.storageService).toBeDefined();
    });

    it('should return all services as instances', () => {
      const services = ServiceFactory.createServices('mock');

      // Verify services implement their interfaces by checking for expected methods
      expect(typeof services.authService.setup).toBe('function');
      expect(typeof services.storageService.getTokens).toBe('function');
      expect(typeof services.apiClient.get).toBe('function');
      expect(typeof services.sheetsSync.createDraft).toBe('function');
    });

    it('should return consistent instances across multiple calls', () => {
      const services1 = ServiceFactory.createServices('mock');
      const services2 = ServiceFactory.createServices('mock');

      // Each call should create new instances
      expect(services1.authService).not.toBe(services2.authService);
      expect(services1.sheetsSync).not.toBe(services2.sheetsSync);
    });

    it('sheetsSync should have all required methods', async () => {
      const services = ServiceFactory.createServices('mock');

      expect(typeof services.sheetsSync.createDraft).toBe('function');
      expect(typeof services.sheetsSync.executeSyncFromDraft).toBe('function');
      expect(typeof services.sheetsSync.hasPendingChanges).toBe('function');
      expect(typeof services.sheetsSync.getLastSyncTime).toBe('function');
    });
  });
});
