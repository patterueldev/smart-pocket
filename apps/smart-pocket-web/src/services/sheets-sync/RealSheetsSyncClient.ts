/**
 * RealSheetsSyncClient: Real implementation of ISheetsSync
 * Makes actual HTTP calls to backend /sheets-sync endpoints
 */

import axios from 'axios';
import type { ISheetsSync, SheetsSyncDraft, SheetsSyncResult } from './ISheetsSync';
import type { IAuthProvider } from './IAuthProvider';
import type { DraftResponse, SyncResponse } from './models';
import { transformToDisplayModel } from './models';
import { getApiBaseUrl } from '@/utils/config';

/**
 * RealSheetsSyncClient: Integrates with backend API for sheets sync
 * Implements ISheetsSync interface for production use
 *
 * Features:
 * - HTTP calls to /sheets-sync/draft and /sheets-sync/sync endpoints
 * - Comprehensive error handling with meaningful messages
 * - Request/response transformation and validation
 * - Logging for debugging and monitoring
 * - Caching of draft ID and last sync time
 * - Depends on IAuthProvider abstraction for authentication
 */
export class RealSheetsSyncClient implements ISheetsSync {
  private readonly baseUrl = '/sheets-sync';
  private lastSyncTimeCache: string | null = null;

  constructor(private authProvider: IAuthProvider) {
    console.log('[RealSheetsSyncClient] Initialized');
  }

  /**
   * Create a draft of pending changes by calling /sheets-sync/draft
   * 
   * Note: In development with React.StrictMode, the first call may fail
   * (transient error during auth initialization), but the second call
   * (after React.StrictMode cleanup) will succeed. This is expected and
   * demonstrates StrictMode catching side effect bugs.
   * 
   * In production (StrictMode disabled), only one call is made.
   * 
   * @throws Error if backend request fails
   */
  async createDraft(): Promise<SheetsSyncDraft> {
    try {
      console.log('[RealSheetsSyncClient] Creating sheets sync draft from backend');

      const token = await this.authProvider.getAccessToken();
      const apiBaseUrl = getApiBaseUrl();

      const response = await axios.post<DraftResponse>(
        `${apiBaseUrl}${this.baseUrl}/draft`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      // Validate response
      if (!response.data || !response.data.draftId) {
        throw new Error('Invalid draft response: missing draftId');
      }

      const data = response.data;

      // Cache the draft ID for subsequent sync operations
      // Note: Currently not used, but kept in response validation

      console.log('[RealSheetsSyncClient] Sheets sync draft created', {
        draftId: data.draftId,
        totalAccounts: data.summary.totalAccounts,
        newAccounts: data.summary.newAccounts,
        updatedAccounts: data.summary.updatedAccounts,
      });

      return {
        draftId: data.draftId,
        totalAccounts: data.summary.totalAccounts,
        newAccounts: data.summary.newAccounts,
        updatedAccounts: data.summary.updatedAccounts,
        unchangedAccounts: data.summary.unchangedAccounts,
        changes: data.pendingChanges.map((change) => transformToDisplayModel(change)),
        createdAt: data.timestamp,
        lastSyncTime: null,
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

      const token = await this.authProvider.getAccessToken();
      const apiBaseUrl = getApiBaseUrl();

      const response = await axios.post<SyncResponse>(
        `${apiBaseUrl}${this.baseUrl}/sync`,
        { draftId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      // Validate response
      if (!response.data) {
        throw new Error('Invalid sync response: empty response');
      }

      const data = response.data;

      // Cache the last sync time
      this.lastSyncTimeCache = data.syncedAt;

      console.log('[RealSheetsSyncClient] Sheets sync executed successfully', {
        draftId,
        success: data.success,
        accountsUpdated: data.accountsUpdated,
        accountsAdded: data.accountsAdded,
        syncedAt: data.syncedAt,
      });

      return {
        success: data.success,
        syncedAt: data.syncedAt,
        accountsUpdated: data.accountsUpdated,
        accountsAdded: data.accountsAdded,
        message: data.message,
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
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as any;

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

    if (error instanceof Error) {
      return error.message || defaultMessage;
    }

    return defaultMessage;
  }

  /**
   * Clear cached data
   * Useful for testing and cleanup
   */
  clearCache(): void {
    this.lastSyncTimeCache = null;
  }
}
