/**
 * ServiceFactory: Creates service instances with dependency injection.
 * Enables switching between real and mock implementations without code changes.
 * 
 * Usage:
 *   const services = ServiceFactory.createServices('mock'); // For development
 *   const services = ServiceFactory.createServices('real');  // For production
 * 
 * Or use environment configuration:
 *   // Uses config from src/config/index.ts
 *   const services = ServiceFactory.createServices();
 */

import { IAuthService, AuthService, MockAuthService } from './auth';
import { IStorageService, StorageService, MockStorageService } from './storage';
import { IApiClient, ApiClient, MockApiClient } from './api';
import { ISheetsSync, MockSheetsSyncClient, RealSheetsSyncClient } from './sheets-sync';
import config from '@/config';

export interface IServices {
  authService: IAuthService;
  storageService: IStorageService;
  apiClient: IApiClient;
  sheetsSync: ISheetsSync;
}

type ServiceMode = 'real' | 'mock' | 'auto';

export class ServiceFactory {
  /**
   * Create services with specified or auto-detected mode
   * @param mode - 'real' (backend), 'mock' (mock data), or 'auto' (use config)
   * @returns IServices instance with all services
   */
  static createServices(mode: ServiceMode = 'auto'): IServices {
    // Determine actual mode
    let actualMode: 'real' | 'mock' = 'mock';
    if (mode === 'auto') {
      actualMode = config.sheets_sync_mode;
    } else if (mode !== 'mock') {
      actualMode = mode;
    }

    const storageService =
      actualMode === 'mock' ? new MockStorageService() : new StorageService();

    const authService =
      actualMode === 'mock'
        ? new MockAuthService(storageService)
        : new AuthService(storageService);

    const apiClient =
      actualMode === 'mock'
        ? new MockApiClient()
        : new ApiClient(authService, storageService);

    const sheetsSync =
      actualMode === 'mock'
        ? new MockSheetsSyncClient()
        : new RealSheetsSyncClient(apiClient);

    if (config.debug) {
      console.log('[ServiceFactory] Created services', {
        mode: actualMode,
        sheetsSync: sheetsSync.constructor.name,
      });
    }

    return {
      authService,
      storageService,
      apiClient,
      sheetsSync,
    };
  }
}
