/**
 * ServiceFactory: Creates service instances with dependency injection.
 * Enables switching between real and mock implementations without code changes.
 * 
 * Usage:
 *   const services = ServiceFactory.createServices('mock'); // For development
 *   const services = ServiceFactory.createServices('real');  // For production
 */

import { IAuthService, AuthService, MockAuthService } from './auth';
import { IStorageService, StorageService, MockStorageService } from './storage';
import { IApiClient, ApiClient, MockApiClient } from './api';

export interface IServices {
  authService: IAuthService;
  storageService: IStorageService;
  apiClient: IApiClient;
}

type ServiceMode = 'real' | 'mock';

export class ServiceFactory {
  static createServices(mode: ServiceMode = 'real'): IServices {
    const storageService =
      mode === 'mock' ? new MockStorageService() : new StorageService();

    const authService =
      mode === 'mock'
        ? new MockAuthService(storageService)
        : new AuthService(storageService);

    const apiClient =
      mode === 'mock'
        ? new MockApiClient()
        : new ApiClient(authService, storageService);

    return {
      authService,
      storageService,
      apiClient,
    };
  }
}
