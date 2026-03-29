import SheetsSyncService from '../../../src/services/SheetsSync/SheetsSyncService';
import { AccountBalance } from '../../../src/interfaces/IActualBudgetService';
import { SheetBalance } from '../../../src/interfaces/IGoogleSheetsService';
import { PendingChange } from '../../../src/interfaces/ISheetsSync';
import Logger from '../../../src/utils/logger';

jest.mock('../../../src/utils/logger');

describe('SheetsSyncService', () => {
  let service: SheetsSyncService;

  const mockActualBalances: AccountBalance[] = [
    {
      accountId: 'acc-1',
      accountName: 'Checking',
      cleared: { amount: '1500.00', currency: 'USD' },
      uncleared: { amount: '100.00', currency: 'USD' },
    },
    {
      accountId: 'acc-2',
      accountName: 'Savings',
      cleared: { amount: '5000.00', currency: 'USD' },
      uncleared: { amount: '0.00', currency: 'USD' },
    },
    {
      accountId: 'acc-3',
      accountName: 'Investment',
      cleared: { amount: '10000.00', currency: 'USD' },
      uncleared: { amount: '500.00', currency: 'USD' },
    },
  ];

  const mockSheetBalances: SheetBalance[] = [
    {
      accountName: 'Checking',
      cleared: { amount: '1500.00', currency: 'USD' },
      uncleared: { amount: '100.00', currency: 'USD' },
      lastSyncedAt: '2024-03-10T00:00:00Z',
    },
    {
      accountName: 'Savings',
      cleared: { amount: '4500.00', currency: 'USD' },
      uncleared: { amount: '0.00', currency: 'USD' },
      lastSyncedAt: '2024-03-10T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SheetsSyncService();
  });

  afterEach(() => {
    // Clear any lingering drafts between tests
    jest.resetModules();
  });

  describe('createDraft', () => {
    it('should identify new accounts', async () => {
      const draft = await service.createDraft(mockActualBalances, mockSheetBalances);

      expect(draft.summary.newAccounts).toBe(1);
      expect(draft.summary.updatedAccounts).toBe(1);
      expect(draft.summary.unchangedAccounts).toBe(1);

      const newAccount = draft.pendingChanges.find((c: PendingChange) => c.type === 'NEW');
      expect(newAccount?.accountName).toBe('Investment');
    });

    it('should identify updated accounts', async () => {
      const draft = await service.createDraft(mockActualBalances, mockSheetBalances);

      const updatedAccount = draft.pendingChanges.find((c: PendingChange) => c.type === 'UPDATE');
      expect(updatedAccount?.accountName).toBe('Savings');
      expect(updatedAccount?.cleared.current.amount).toBe('5000.00');
      expect(updatedAccount?.cleared.synced.amount).toBe('4500.00');
    });

    it('should identify unchanged accounts', async () => {
      const draft = await service.createDraft(mockActualBalances, mockSheetBalances);

      const unchangedCount = draft.summary.unchangedAccounts;
      expect(unchangedCount).toBe(1);
    });

    it('should generate unique draft IDs', async () => {
      const draft1 = await service.createDraft(mockActualBalances, mockSheetBalances);
      const draft2 = await service.createDraft(mockActualBalances, mockSheetBalances);

      expect(draft1.id).not.toBe(draft2.id);
    });

    it('should handle empty sheet balances', async () => {
      const draft = await service.createDraft(mockActualBalances, []);

      expect(draft.summary.newAccounts).toBe(3);
      expect(draft.summary.updatedAccounts).toBe(0);
      expect(draft.summary.unchangedAccounts).toBe(0);
      expect(draft.pendingChanges).toHaveLength(3);
    });

    it('should handle empty actual balances', async () => {
      const draft = await service.createDraft([], mockSheetBalances);

      expect(draft.summary.totalAccounts).toBe(0);
      expect(draft.summary.newAccounts).toBe(0);
      expect(draft.pendingChanges).toHaveLength(0);
    });
  });

  describe('getDraft', () => {
    it('should retrieve a draft by ID', async () => {
      const created = await service.createDraft(mockActualBalances, mockSheetBalances);
      const retrieved = await service.getDraft(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent draft', async () => {
      const retrieved = await service.getDraft('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('executeSyncFromDraft', () => {
    it('should successfully execute sync from draft', async () => {
      const draft = await service.createDraft(mockActualBalances, mockSheetBalances);

      const result = await service.executeSyncFromDraft(draft.id);

      expect(result.success).toBe(true);
      expect(result.accountsUpdated).toBe(2);
      expect(result.syncedAt).toBeDefined();
    });

    it('should return failure for non-existent draft', async () => {
      const result = await service.executeSyncFromDraft('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('should delete draft after successful sync', async () => {
      const draft = await service.createDraft(mockActualBalances, mockSheetBalances);
      const draftId = draft.id;

      await service.executeSyncFromDraft(draftId);

      const retrieved = await service.getDraft(draftId);
      expect(retrieved).toBeNull();
    });
  });

  describe('listDrafts', () => {
    it('should list all active drafts', async () => {
      const draft1 = await service.createDraft(mockActualBalances, mockSheetBalances);
      const draft2 = await service.createDraft(mockActualBalances, []);

      const drafts = await service.listDrafts();

      expect(drafts).toHaveLength(2);
      expect(drafts.map((d: any) => d.id)).toContain(draft1.id);
      expect(drafts.map((d: any) => d.id)).toContain(draft2.id);
    });
  });
});
