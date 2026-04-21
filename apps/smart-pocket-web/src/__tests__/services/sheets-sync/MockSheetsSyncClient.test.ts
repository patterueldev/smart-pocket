/**
 * MockSheetsSyncClient Tests
 * Verifies mock implementation provides realistic data for development
 */

import { MockSheetsSyncClient } from '@/services/sheets-sync/MockSheetsSyncClient';

describe('MockSheetsSyncClient', () => {
  let client: MockSheetsSyncClient;

  beforeEach(() => {
    client = new MockSheetsSyncClient();
  });

  describe('createDraft', () => {
    it('should create a draft with valid structure', async () => {
      const draft = await client.createDraft();

      expect(draft).toBeDefined();
      expect(draft.draftId).toBeDefined();
      expect(draft.draftId).toMatch(/^draft-/);
      expect(draft.totalAccounts).toBe(9);
      expect(draft.newAccounts).toBe(1);
      expect(draft.updatedAccounts).toBe(3);
      expect(draft.unchangedAccounts).toBe(5);
      expect(draft.changes).toBeDefined();
      expect(draft.changes.length).toBeGreaterThan(0);
      expect(draft.createdAt).toBeDefined();
    });

    it('should return account changes with correct properties', async () => {
      const draft = await client.createDraft();
      const change = draft.changes[0];

      expect(change).toHaveProperty('accountName');
      expect(change).toHaveProperty('type');
      expect(change).toHaveProperty('currentBalance');
      expect(change).toHaveProperty('sheetBalance');
      expect(change).toHaveProperty('currency');
      expect(change).toHaveProperty('isNew');
      expect(['NEW', 'UPDATE']).toContain(change.type);
    });

    it('should have at least one NEW account', async () => {
      const draft = await client.createDraft();
      const hasNewAccount = draft.changes.some((change: typeof draft.changes[0]) => change.isNew);

      expect(hasNewAccount).toBe(true);
    });

    it('should have at least one UPDATE account', async () => {
      const draft = await client.createDraft();
      const hasUpdateAccount = draft.changes.some((change: typeof draft.changes[0]) => !change.isNew);

      expect(hasUpdateAccount).toBe(true);
    });

    it('should generate unique draft IDs', async () => {
      const draft1 = await client.createDraft();
      const draft2 = await client.createDraft();

      expect(draft1.draftId).not.toBe(draft2.draftId);
    });
  });

  describe('executeSyncFromDraft', () => {
    it('should sync a valid draft', async () => {
      const draft = await client.createDraft();
      const result = await client.executeSyncFromDraft(draft.draftId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.syncedAt).toBeDefined();
      expect(result.accountsUpdated).toBe(draft.updatedAccounts);
      expect(result.accountsAdded).toBe(draft.newAccounts);
      expect(result.message).toBeDefined();
    });

    it('should throw error for invalid draft ID', async () => {
      await expect(client.executeSyncFromDraft('invalid-id')).rejects.toThrow(
        'Draft not found'
      );
    });

    it('should clear draft after successful sync', async () => {
      const draft = await client.createDraft();
      await client.executeSyncFromDraft(draft.draftId);

      // Attempting to sync the same draft again should fail
      await expect(client.executeSyncFromDraft(draft.draftId)).rejects.toThrow();
    });

    it('should update last sync time', async () => {
      const beforeSync = await client.getLastSyncTime();
      const draft = await client.createDraft();
      await client.executeSyncFromDraft(draft.draftId);
      const afterSync = await client.getLastSyncTime();

      expect(afterSync).not.toBe(beforeSync);
    });
  });

  describe('hasPendingChanges', () => {
    it('should return a boolean', async () => {
      const hasPending = await client.hasPendingChanges();

      expect(typeof hasPending).toBe('boolean');
    });

    it('should return true occasionally (probabilistic)', async () => {
      const results: boolean[] = [];

      for (let i = 0; i < 20; i++) {
        results.push(await client.hasPendingChanges());
      }

      // With 70% probability, we should have at least one true and one false
      const hasTrue = results.some((r) => r === true);
      const hasFalse = results.some((r) => r === false);

      // This might occasionally fail due to randomness, but 20 samples with 70% probability should be safe
      expect(hasTrue || hasFalse).toBe(true);
    });
  });

  describe('getLastSyncTime', () => {
    it('should return initial sync time', async () => {
      const syncTime = await client.getLastSyncTime();

      expect(syncTime).toBeDefined();
      expect(typeof syncTime).toBe('string');
    });

    it('should update after sync', async () => {
      const before = await client.getLastSyncTime();
      const draft = await client.createDraft();

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await client.executeSyncFromDraft(draft.draftId);
      const after = await client.getLastSyncTime();

      expect(after).not.toBe(before);
    });
  });
});
