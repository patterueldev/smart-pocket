/**
 * RealSheetsSyncClient Unit Tests
 * Tests HTTP integration with backend /sheets-sync endpoints
 */

import { RealSheetsSyncClient } from '@/services/sheets-sync/RealSheetsSyncClient';
import { SheetsSyncDraft, SheetsSyncResult, AccountChange } from '@/services/sheets-sync/ISheetsSync';
import { ApiClient } from '@/services/api/ApiClient';

// Mock ApiClient
jest.mock('@/services/api/ApiClient');

describe('RealSheetsSyncClient', () => {
  let client: RealSheetsSyncClient;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = new ApiClient() as jest.Mocked<ApiClient>;
    client = new RealSheetsSyncClient(mockApiClient);
  });

  describe('createDraft()', () => {
    it('should successfully create a draft from backend', async () => {
      const mockDraft = {
        draftId: 'draft-real-123',
        totalAccounts: 5,
        newAccounts: 1,
        updatedAccounts: 2,
        unchangedAccounts: 2,
        changes: [
          {
            accountId: 'acc1',
            accountName: 'Checking',
            currentBalance: 1500,
            sheetBalance: 1400,
            currency: 'USD',
            isNew: false,
            lastSyncTime: '2026-03-30T10:00:00Z',
          },
        ],
        createdAt: '2026-03-30T11:00:00Z',
        lastSyncTime: '2026-03-30T10:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);

      const result = await client.createDraft();

      expect(mockApiClient.post).toHaveBeenCalledWith('/sheets-sync/draft');
      expect(result).toEqual(mockDraft);
      expect(result.draftId).toBe('draft-real-123');
      expect(result.totalAccounts).toBe(5);
    });

    it('should throw error if draft response is invalid (missing draftId)', async () => {
      const invalidDraft = {
        totalAccounts: 5,
        newAccounts: 1,
        updatedAccounts: 2,
        unchangedAccounts: 2,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(invalidDraft);

      await expect(client.createDraft()).rejects.toThrow(
        'Invalid draft response: missing draftId'
      );
    });

    it('should handle network timeout error', async () => {
      const timeoutError = new Error('Request timeout: Backend took too long to respond');
      timeoutError.code = 'ECONNABORTED';

      mockApiClient.post = jest.fn().mockRejectedValue(timeoutError);

      await expect(client.createDraft()).rejects.toThrow('Request timeout');
    });

    it('should handle backend 500 error', async () => {
      const serverError = new Error('Internal server error');
      (serverError as any).response = {
        status: 500,
        data: { message: 'Database connection failed' },
      };

      mockApiClient.post = jest.fn().mockRejectedValue(serverError);

      await expect(client.createDraft()).rejects.toThrow('Database connection failed');
    });

    it('should handle backend 404 error', async () => {
      const notFoundError = new Error('Not found');
      (notFoundError as any).response = {
        status: 404,
        data: { message: 'Configuration not found' },
      };

      mockApiClient.post = jest.fn().mockRejectedValue(notFoundError);

      await expect(client.createDraft()).rejects.toThrow('Configuration not found');
    });
  });

  describe('executeSyncFromDraft()', () => {
    it('should successfully execute sync from draft', async () => {
      const mockResult = {
        success: true,
        syncedAt: '2026-03-30T12:00:00Z',
        accountsUpdated: 2,
        accountsAdded: 1,
        message: 'Sync completed successfully',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResult);

      const result = await client.executeSyncFromDraft('draft-real-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/sheets-sync/sync', {
        draftId: 'draft-real-123',
      });
      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
      expect(result.accountsUpdated).toBe(2);
    });

    it('should throw error if sync response is invalid', async () => {
      mockApiClient.post = jest.fn().mockResolvedValue(null);

      await expect(client.executeSyncFromDraft('draft-123')).rejects.toThrow(
        'Invalid sync response: empty response'
      );
    });

    it('should handle 404 error when draft not found', async () => {
      const notFoundError = new Error('Draft not found');
      (notFoundError as any).response = {
        status: 404,
        data: { message: 'Draft expired or already synced' },
      };

      mockApiClient.post = jest.fn().mockRejectedValue(notFoundError);

      await expect(client.executeSyncFromDraft('invalid-draft-id')).rejects.toThrow(
        'Draft expired or already synced'
      );
    });

    it('should cache last sync time', async () => {
      const mockResult = {
        success: true,
        syncedAt: '2026-03-30T12:00:00Z',
        accountsUpdated: 2,
        accountsAdded: 1,
        message: 'Sync completed successfully',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResult);

      await client.executeSyncFromDraft('draft-123');

      const lastSyncTime = await client.getLastSyncTime();
      expect(lastSyncTime).toBe('2026-03-30T12:00:00Z');
    });
  });

  describe('hasPendingChanges()', () => {
    it('should return true if there are pending changes', async () => {
      const mockDraft = {
        draftId: 'draft-123',
        totalAccounts: 5,
        newAccounts: 1,
        updatedAccounts: 2,
        unchangedAccounts: 2,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(true); // newAccounts (1) + updatedAccounts (2) > 0
    });

    it('should return false if there are no pending changes', async () => {
      const mockDraft = {
        draftId: 'draft-123',
        totalAccounts: 5,
        newAccounts: 0,
        updatedAccounts: 0,
        unchangedAccounts: 5,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });

    it('should return false if draft creation fails', async () => {
      mockApiClient.post = jest.fn().mockRejectedValue(new Error('Network error'));

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });
  });

  describe('getLastSyncTime()', () => {
    it('should return cached sync time if available', async () => {
      const mockResult = {
        success: true,
        syncedAt: '2026-03-30T12:00:00Z',
        accountsUpdated: 2,
        accountsAdded: 1,
        message: 'Sync completed successfully',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResult);

      await client.executeSyncFromDraft('draft-123');
      const lastSyncTime = await client.getLastSyncTime();

      expect(lastSyncTime).toBe('2026-03-30T12:00:00Z');
      // Should not call apiClient again if cached
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should query backend if cache is empty', async () => {
      const mockDraft = {
        draftId: 'draft-123',
        totalAccounts: 5,
        newAccounts: 0,
        updatedAccounts: 0,
        unchangedAccounts: 5,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
        lastSyncTime: '2026-03-29T10:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);

      const lastSyncTime = await client.getLastSyncTime();

      expect(lastSyncTime).toBe('2026-03-29T10:00:00Z');
      expect(mockApiClient.post).toHaveBeenCalledWith('/sheets-sync/draft');
    });

    it('should return null if no sync time available', async () => {
      const mockDraft = {
        draftId: 'draft-123',
        totalAccounts: 5,
        newAccounts: 0,
        updatedAccounts: 0,
        unchangedAccounts: 5,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
        lastSyncTime: null,
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);

      const lastSyncTime = await client.getLastSyncTime();

      expect(lastSyncTime).toBeNull();
    });

    it('should return null if backend query fails', async () => {
      mockApiClient.post = jest.fn().mockRejectedValue(new Error('Network error'));

      const lastSyncTime = await client.getLastSyncTime();

      expect(lastSyncTime).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle network connection error', async () => {
      const connError = new Error('Could not reach backend');
      connError.code = 'ENOTFOUND';

      mockApiClient.post = jest.fn().mockRejectedValue(connError);

      await expect(client.createDraft()).rejects.toThrow('Could not reach backend');
    });

    it('should handle 401 unauthorized error', async () => {
      const authError = new Error('Unauthorized');
      (authError as any).response = {
        status: 401,
        data: { message: 'Invalid API key' },
      };

      mockApiClient.post = jest.fn().mockRejectedValue(authError);

      await expect(client.createDraft()).rejects.toThrow('Please check your API key');
    });

    it('should handle 400 bad request error', async () => {
      const badReqError = new Error('Bad request');
      (badReqError as any).response = {
        status: 400,
        data: { message: 'Missing required field: apiKey' },
      };

      mockApiClient.post = jest.fn().mockRejectedValue(badReqError);

      await expect(client.createDraft()).rejects.toThrow('Missing required field: apiKey');
    });
  });

  describe('Cache management', () => {
    it('should clear cache on demand', async () => {
      const mockResult = {
        success: true,
        syncedAt: '2026-03-30T12:00:00Z',
        accountsUpdated: 2,
        accountsAdded: 1,
        message: 'Sync completed successfully',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResult);

      await client.executeSyncFromDraft('draft-123');
      client.clearCache();

      // After clearing, should query backend again
      const mockDraft = {
        draftId: 'draft-456',
        totalAccounts: 5,
        newAccounts: 0,
        updatedAccounts: 0,
        unchangedAccounts: 5,
        changes: [],
        createdAt: '2026-03-30T11:00:00Z',
        lastSyncTime: '2026-03-29T10:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockDraft);
      const lastSyncTime = await client.getLastSyncTime();

      expect(lastSyncTime).toBe('2026-03-29T10:00:00Z');
      expect(mockApiClient.post).toHaveBeenCalled();
    });
  });
});
