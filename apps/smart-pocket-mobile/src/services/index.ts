/**
 * Services index: Exports all service interfaces, implementations, and factory.
 * 
 * Import structure:
 *   - Interfaces: import { IAuthService } from '@/services/auth'
 *   - Implementations: import { AuthService } from '@/services/auth'
 *   - Factory: import { ServiceFactory } from '@/services'
 */

export { IAuthService, AuthService, MockAuthService } from './auth';
export { IStorageService, StorageService, MockStorageService } from './storage';
export { IApiClient, ApiClient, MockApiClient } from './api';
export { ServiceFactory, type IServices } from './ServiceFactory';
