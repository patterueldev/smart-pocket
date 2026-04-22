/**
 * RealSheetsSyncClient Tests
 * Verifies HTTP client implementation and error handling
 */

import axios from 'axios';
import { RealSheetsSyncClient } from '@/services/sheets-sync/RealSheetsSyncClient';
import type { DraftResponse, SyncResponse } from '@/services/sheets-sync/models';

// Mock axios
jest.mock('axios');

describe('RealSheetsSyncClient', () => {
  const mockAuthProvider = {
    getAccessToken: jest.fn(() => Promise.resolve('test-token')),
    getApiBaseUrl: jest.fn(() => 'http://localhost:3000'),
  };
  let client: RealSheetsSyncClient;

  const createAxiosError = (status: number, message: string, data?: any) => {
    const error = {
      name: 'AxiosError',
      message,
      response: {
        status,
        data: data || { message },
        statusText: message,
        headers: {},
        config: {} as any,
      },
      config: {} as any,
      code: 'ERR_BAD_RESPONSE',
      request: {} as any,
      isAxiosError: true,
    };
    return error as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup axios.isAxiosError to properly detect our mock errors
    (axios.isAxiosError as any).mockImplementation((error: any) => {
      return error && error.isAxiosError === true;
    });
    client = new RealSheetsSyncClient(mockAuthProvider);
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
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const draft = await client.createDraft();

      expect(draft).toBeDefined();
      expect(draft.draftId).toBe('draft-123');
      expect(draft.totalAccounts).toBe(3);
      expect(draft.newAccounts).toBe(1);
      expect(draft.updatedAccounts).toBe(1);
      expect(draft.changes.length).toBe(1);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sheets-sync/draft'),
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    it('should throw error if response missing draftId', async () => {
      const mockResponse = createMockDraftResponse();
      const { draftId, ...responseWithoutId } = mockResponse;
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: responseWithoutId });

      await expect(client.createDraft()).rejects.toThrow('Invalid draft response');
    });

    it('should handle HTTP 401 error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(
        createAxiosError(401, 'Unauthorized', { message: 'Invalid token' })
      );

      await expect(client.createDraft()).rejects.toThrow('Unauthorized');
    });

    it('should handle HTTP 500 error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(
        createAxiosError(500, 'Server Error', { message: 'Internal server error' })
      );

      await expect(client.createDraft()).rejects.toThrow('Server error');
    });

    it('should handle generic error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));

      await expect(client.createDraft()).rejects.toThrow('Network failed');
    });
  });

  describe('executeSyncFromDraft', () => {
    it('should execute sync successfully', async () => {
      const mockResponse = createMockSyncResponse();
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await client.executeSyncFromDraft('draft-123');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.accountsUpdated).toBe(1);
      expect(result.accountsAdded).toBe(1);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sheets-sync/sync'),
        { draftId: 'draft-123' },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    it('should throw error if response is empty', async () => {
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(client.executeSyncFromDraft('draft-123')).rejects.toThrow(
        'Invalid sync response'
      );
    });

    it('should handle HTTP 404 error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(
        createAxiosError(404, 'Not Found', { message: 'Draft not found' })
      );

      await expect(client.executeSyncFromDraft('invalid-id')).rejects.toThrow(
        'Not found'
      );
    });
  });

  describe('hasPendingChanges', () => {
    it('should return true if there are pending changes', async () => {
      const mockResponse = createMockDraftResponse();
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(true);
    });

    it('should return false if no pending changes', async () => {
      const mockResponse = createMockDraftResponse();
      mockResponse.summary.newAccounts = 0;
      mockResponse.summary.updatedAccounts = 0;
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });

    it('should return false on error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const hasPending = await client.hasPendingChanges();

      expect(hasPending).toBe(false);
    });
  });

  describe('getLastSyncTime', () => {
    it('should return last sync time', async () => {
      const mockResponse = createMockDraftResponse();
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBeDefined();
    });

    it('should return cached sync time', async () => {
      const mockResponse = createMockSyncResponse();
      const syncedAt = mockResponse.syncedAt;
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      await client.executeSyncFromDraft('draft-123');

      // Clear the mock to verify cache is used
      (axios.post as jest.Mock).mockClear();

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBe(syncedAt);
      expect(axios.post).not.toHaveBeenCalled(); // Cache was used
    });

    it('should return null on error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cached sync time', async () => {
      const mockSyncResponse = createMockSyncResponse();
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockSyncResponse });

      await client.executeSyncFromDraft('draft-123');

      client.clearCache();

      const mockDraftResponse = createMockDraftResponse();
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockDraftResponse });

      await client.getLastSyncTime();

      // After clearing cache, should call API again
      expect(axios.post).toHaveBeenCalledTimes(2);
    });
  });
});
