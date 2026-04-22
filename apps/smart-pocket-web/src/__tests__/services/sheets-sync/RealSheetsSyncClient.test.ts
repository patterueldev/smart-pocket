/**
 * RealSheetsSyncClient Tests
 * Verifies API client implementation and error handling
 */

import { RealSheetsSyncClient } from '@/services/sheets-sync/RealSheetsSyncClient';
import type { IApiClient } from '@/services/api/IApiClient';
import type { DraftResponse, SyncResponse } from '@/services/sheets-sync/models';

describe('RealSheetsSyncClient', () => {
  const mockApiClient: jest.Mocked<IApiClient> = {
    initialize: jest.fn(),
    updateAccessToken: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    reset: jest.fn(),
  };
  let client: RealSheetsSyncClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new RealSheetsSyncClient(mockApiClient);
  });

  const createMockDraftResponse = (): DraftResponse => ({
    success: true,
    draftId: 'draft-123',
    summary: {
      totalAccounts: 3,
      newAccounts: 1,
      updatedAccounts: 1,
      unchangedAccounts: 1,
    },
    pendingChanges: [
      {
        accountName: 'Test Account',
        type: 'UPDATE',
        cleared: {
          current: { amount: '1000.00', currency: 'USD' },
          synced: { amount: '900.00', currency: 'USD' },
        },
        uncleared: {
          current: { amount: '100.00', currency: 'USD' },
          synced: { amount: '50.00', currency: 'USD' },
        },
      },
    ],
    timestamp: new Date().toISOString(),
  });

  const createMockSyncResponse = (): SyncResponse => ({
    success: true,
    syncedAt: new Date().toISOString(),
    accountsUpdated: 1,
    accountsAdded: 1,
    message: 'Sync successful',
  });

  describe('createDraft', () => {
    it('should create draft successfully', async () => {
      const mockResponse = createMockDraftResponse();
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const draft = await client.createDraft();

      expect(draft).toBeDefined();
      expect(draft.draftId).toBe('draft-123');
      expect(draft.totalAccounts).toBe(3);
      expect(draft.newAccounts).toBe(1);
      expect(draft.updatedAccounts).toBe(1);
      expect(draft.changes.length).toBe(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/sheets-sync/draft', {});
    });

    it('should throw error if response missing draftId', async () => {
      const mockResponse = createMockDraftResponse();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { draftId, ...responseWithoutId } = mockResponse;
      mockApiClient.post.mockResolvedValueOnce(responseWithoutId);

      await expect(client.createDraft()).rejects.toThrow('Invalid draft response');
    });

    it('should handle error with 401 status', async () => {
      const error = new Error('Unauthorized: Please check your API key');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(client.createDraft()).rejects.toThrow('Unauthorized');
    });

    it('should handle HTTP 500 error', async () => {
      const error = new Error('Server error: Internal server error');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(client.createDraft()).rejects.toThrow('Server error');
    });

    it('should handle generic error', async () => {
      const error = new Error('Network failed');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(client.createDraft()).rejects.toThrow('Network failed');
    });
  });

  describe('executeSyncFromDraft', () => {
    it('should execute sync successfully', async () => {
      const mockResponse = createMockSyncResponse();
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await client.executeSyncFromDraft('draft-123');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountsUpdated).toBe(1);
      expect(result.accountsAdded).toBe(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/sheets-sync/sync', { draftId: 'draft-123' });
    });

    it('should throw error if response is empty', async () => {
      mockApiClient.post.mockResolvedValueOnce(null);

      await expect(client.executeSyncFromDraft('draft-123')).rejects.toThrow(
        'Invalid sync response'
      );
    });

    it('should handle HTTP 404 error', async () => {
      const error = new Error('Not found: Draft not found');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(client.executeSyncFromDraft('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('hasPendingChanges', () => {
    it('should return true if there are pending changes', async () => {
      const mockResponse = createMockDraftResponse();
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(true);
    });

    it('should return false if no pending changes', async () => {
      const mockResponse = createMockDraftResponse();
      mockResponse.summary.newAccounts = 0;
      mockResponse.summary.updatedAccounts = 0;
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });

    it('should return false on error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });
  });

  describe('getLastSyncTime', () => {
    it('should return last sync time', async () => {
      const mockResponse = createMockDraftResponse();
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBeDefined();
    });

    it('should return cached sync time', async () => {
      const mockResponse = createMockSyncResponse();
      const syncedAt = mockResponse.syncedAt;
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await client.executeSyncFromDraft('draft-123');

      // Clear the mock to verify cache is used
      mockApiClient.post.mockClear();

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBe(syncedAt);
      expect(mockApiClient.post).not.toHaveBeenCalled(); // Cache was used
    });

    it('should return null on error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cached sync time', async () => {
      const mockSyncResponse = createMockSyncResponse();
      mockApiClient.post.mockResolvedValueOnce(mockSyncResponse);

      await client.executeSyncFromDraft('draft-123');

      client.clearCache();

      const mockDraftResponse = createMockDraftResponse();
      mockApiClient.post.mockResolvedValueOnce(mockDraftResponse);

      await client.getLastSyncTime();

      // After clearing cache, should call API again
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });
  });
});
