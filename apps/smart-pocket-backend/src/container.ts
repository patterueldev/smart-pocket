import { IJwtService } from './interfaces';
import { JwtService } from './services/JwtService';
import { Logger, ILogger } from './utils/logger';
import ActualBudgetService from './services/ActualBudgetService';
import GoogleSheetsService from './services/GoogleSheetsService';
import SheetsSyncService from './services/SheetsSync/SheetsSyncService';
import SheetsSyncController from './controllers/SheetsSyncController';
import { IActualBudgetService } from './interfaces/IActualBudgetService';
import { IGoogleSheetsService } from './interfaces/IGoogleSheetsService';
import { ISheetsSync } from './interfaces/ISheetsSync';
import { ISheetsSyncController } from './interfaces/ISheetsSyncController';

/**
 * Service Container / IoC Container
 * Manages service instantiation and dependency injection
 * Supports both singleton and factory patterns
 */
class ServiceContainer {
  private services: Map<string, unknown> = new Map();
  private singletons: Map<string, unknown> = new Map();

  /**
   * Register a singleton service (created once, reused)
   */
  registerSingleton<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  /**
   * Get a singleton service (creates on first access, caches after)
   */
  getSingleton<T>(name: string): T {
    if (!this.singletons.has(name)) {
      const factory = this.services.get(name) as (() => T) | undefined;
      if (!factory) {
        throw new Error(`Service "${name}" not registered`);
      }
      this.singletons.set(name, factory());
    }
    return this.singletons.get(name) as T;
  }

  /**
   * Register a factory service (created fresh each time)
   */
  registerFactory<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, isFactory: true } as unknown);
  }

  /**
   * Get a factory service (creates new instance each time)
   */
  getFactory<T>(name: string): T {
    const entry = this.services.get(name) as { factory: () => T; isFactory: boolean } | undefined;
    if (!entry || !entry.isFactory) {
      throw new Error(`Factory service "${name}" not registered`);
    }
    return entry.factory();
  }

  /**
   * Get a service (automatically handles singleton/factory)
   */
  get<T>(name: string): T {
    const entry = this.services.get(name);
    if (!entry) {
      throw new Error(`Service "${name}" not registered`);
    }

    // If it's a factory entry
    if (typeof entry === 'object' && 'factory' in entry) {
      return (entry as { factory: () => T }).factory();
    }

    // Otherwise it's a singleton factory
    if (!this.singletons.has(name)) {
      this.singletons.set(name, (entry as () => T)());
    }
    return this.singletons.get(name) as T;
  }

  /**
   * Clear all cached singletons (useful for testing)
   */
  clear(): void {
    this.singletons.clear();
  }
}

/**
 * Global service container instance
 */
const container = new ServiceContainer();

/**
 * Initialize default services
 */
function initializeServices(): void {
  // Register JWT Service as singleton (uses class constructor)
  container.registerSingleton<IJwtService>('jwtService', () => new JwtService());

  // Register Logger as singleton (uses class constructor)
  container.registerSingleton<ILogger>('logger', () => new Logger());

  // Register Actual Budget Service as singleton
  container.registerSingleton<IActualBudgetService>(
    'actualBudgetService',
    () => new ActualBudgetService()
  );

  // Register Google Sheets Service as singleton
  container.registerSingleton<IGoogleSheetsService>(
    'googleSheetsService',
    () => new GoogleSheetsService()
  );

  // Register Sheets Sync Service as singleton
  container.registerSingleton<ISheetsSync>('sheetsSyncService', () => new SheetsSyncService());

  // Register Sheets Sync Controller as singleton (depends on services)
  container.registerSingleton<ISheetsSyncController>(
    'sheetsSyncController',
    () =>
      new SheetsSyncController(
        container.get<IActualBudgetService>('actualBudgetService'),
        container.get<IGoogleSheetsService>('googleSheetsService'),
        container.get<ISheetsSync>('sheetsSyncService'),
        container.get<Logger>('logger')
      )
  );
}

// Initialize on module load
initializeServices();

export { ServiceContainer };
export default container;
