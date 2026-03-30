/**
 * RealSheetsSyncClient: Real implementation of ISheetsSync
 * Makes actual HTTP calls to backend /sheets-sync endpoints
 */

import { ISheetsSync, SheetsSyncDraft, SheetsSyncResult, AccountChange } from './ISheetsSync';
import { ApiClient } from '@/services/api/ApiClient';

/**
 * Backend response for draft creation
 */
interface DraftResponse {
  draftId: string;
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
  unchangedAccounts: number;
  changes: AccountChange[];
  createdAt: string;
  lastSyncTime?: string | null;
}

/**
 * Backend response for sync execution
 */
interface SyncResponse {
  success: boolean;
  syncedAt: string;
  accountsUpdated: number;
  accountsAdded: number;
  message: string;
}

/**
 * RealSheetsSyncClient: Integrates with backend API for sheets sync
 * Implements ISheetsSync interface for production use
 *
 * Features:
 * - HTTP calls to /sheets-sync/draft and /sheets-sync/sync endpoints
 * - Comprehensive error handling with meaningful messages
 * - Request/response transformation and validation
 * - Logging for debugging and monitoring
 * - Retry logic for transient failures (handled by axios interceptor)
 */
export class RealSheetsSyncClient implements ISheetsSync {
  private readonly apiClient: ApiClient;
  private readonly baseUrl = '/sheets-sync';
  private lastDraftId: string | null = null;
  private lastSyncTimeCache: string | null = null;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    console.log('[RealSheetsSyncClient] Initialized');
  }

  /**
   * Create a draft of pending changes by calling /sheets-sync/draft
   * @throws Error if backend request fails
   */
  async createDraft(): Promise<SheetsSyncDraft> {
    try {
      console.log('[RealSheetsSyncClient] Creating sheets sync draft from backend');

      const response = await this.apiClient.post<DraftResponse>(`${this.baseUrl}/draft`);

      // Validate response
      if (!response || !response.draftId) {
        throw new Error('Invalid draft response: missing draftId');
      }

      // Cache the draft ID for subsequent sync operations
      this.lastDraftId = response.draftId;

      console.log('[RealSheetsSyncClient] Sheets sync draft created', {
        draftId: response.draftId,
        totalAccounts: response.totalAccounts,
        newAccounts: response.newAccounts,
        updatedAccounts: response.updatedAccounts,
      });

      return {
        draftId: response.draftId,
        totalAccounts: response.totalAccounts,
        newAccounts: response.newAccounts,
        updatedAccounts: response.updatedAccounts,
        unchangedAccounts: response.unchangedAccounts,
        changes: response.changes || [],
        createdAt: response.createdAt,
        lastSyncTime: response.lastSyncTime,
      };
    } catch (error) {
      const errorMessage = this.formatError(error, 'Failed to create sheets sync draft');
      console.error('[RealSheetsSyncClient] Error creating draft', { error });
      throw new Error(errorMessage);
    }
  }

  /**
   * Execute sync based on a draft ID by calling /sheets-sync/sync
   * @param draftId - ID of the draft to sync
   * @throws Error if backend request fails or draft not found
   */
  async executeSyncFromDraft(draftId: string): Promise<SheetsSyncResult> {
    try {
      console.log('[RealSheetsSyncClient] Executing sheets sync from draft', { draftId });

      const response = await this.apiClient.post<SyncResponse>(`${this.baseUrl}/sync`, {
        draftId,
      });

      // Validate response
      if (!response) {
        throw new Error('Invalid sync response: empty response');
      }

      // Cache the last sync time
      this.lastSyncTimeCache = response.syncedAt;

      console.log('[RealSheetsSyncClient] Sheets sync executed successfully', {
        draftId,
        success: response.success,
        accountsUpdated: response.accountsUpdated,
        accountsAdded: response.accountsAdded,
        syncedAt: response.syncedAt,
      });

      return {
        success: response.success,
        syncedAt: response.syncedAt,
        accountsUpdated: response.accountsUpdated,
        accountsAdded: response.accountsAdded,
        message: response.message,
      };
    } catch (error) {
      const errorMessage = this.formatError(error, 'Failed to execute sheets sync');
      console.error('[RealSheetsSyncClient] Error executing sync', { error, draftId });
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if sync is available (has pending changes)
   * This is a convenience method that calls createDraft and checks for changes
   */
  async hasPendingChanges(): Promise<boolean> {
    try {
      const draft = await this.createDraft();
      return draft.newAccounts > 0 || draft.updatedAccounts > 0;
    } catch (error) {
      // If draft creation fails, assume no pending changes
      console.warn('[RealSheetsSyncClient] Could not check for pending changes', { error });
      return false;
    }
  }

  /**
   * Get last sync timestamp
   * Uses cached value from last sync, or queries backend
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      if (this.lastSyncTimeCache) {
        return this.lastSyncTimeCache;
      }

      // Create a draft to get the lastSyncTime from backend
      const draft = await this.createDraft();
      return draft.lastSyncTime || null;
    } catch (error) {
      console.warn('[RealSheetsSyncClient] Could not get last sync time', { error });
      return null;
    }
  }

  /**
   * Format error messages for consistency
   * Extracts meaningful error information from various error types
   */
  private formatError(error: any, defaultMessage: string): string {
    if (error instanceof Error) {
      // Axios error with response
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;

        switch (status) {
          case 400:
            return `Bad request: ${data?.message || 'Invalid parameters'}`;
          case 401:
            return 'Unauthorized: Please check your API key';
          case 404:
            return `Not found: ${data?.message || 'Resource not found'}`;
          case 500:
            return `Server error: ${data?.message || 'Internal server error'}`;
          default:
            return `HTTP ${status}: ${data?.message || defaultMessage}`;
        }
      }

      // Network error
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout: Backend took too long to respond';
      }

      if (error.code === 'ENOTFOUND') {
        return 'Network error: Could not reach backend server';
      }

      return error.message || defaultMessage;
    }

    return defaultMessage;
  }

  /**
   * Clear cached data
   * Useful for testing and cleanup
   */
  clearCache(): void {
    this.lastDraftId = null;
    this.lastSyncTimeCache = null;
  }
}
