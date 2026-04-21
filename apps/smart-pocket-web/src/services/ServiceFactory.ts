/**
 * ServiceFactory: Dependency Injection container
 * Creates and manages service instances with proper dependencies
 */

import type { IAuthService } from './auth/IAuthService';
import { AuthService } from './auth/AuthService';
import { MockAuthService } from './auth/MockAuthService';
import type { IStorageService } from './storage/IStorageService';
import { LocalStorageService } from './storage/LocalStorageService';

export class ServiceFactory {
  private static storageService: IStorageService | null = null;
  private static authService: IAuthService | null = null;

  /**
   * Create or return singleton StorageService
   */
  static getStorageService(): IStorageService {
    if (!this.storageService) {
      this.storageService = new LocalStorageService();
    }
    return this.storageService;
  }

  /**
   * Create or return singleton AuthService
   * Uses real implementation by default, set USE_MOCK_AUTH to use mock
   */
  static getAuthService(): IAuthService {
    if (!this.authService) {
      const useMock = import.meta.env.MODE === 'development' && 
                      new URLSearchParams(window.location.search).get('useMockAuth') === 'true';
      
      const storageService = this.getStorageService();
      
      if (useMock) {
        console.log('[ServiceFactory] Using MockAuthService');
        this.authService = new MockAuthService(storageService);
      } else {
        console.log('[ServiceFactory] Using AuthService');
        this.authService = new AuthService(storageService);
      }
    }
    return this.authService;
  }

  /**
   * Reset services (useful for testing)
   */
  static reset(): void {
    this.storageService = null;
    this.authService = null;
  }
}
