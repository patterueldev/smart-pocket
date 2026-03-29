/**
 * Mock Google Sheets Sync Client
 * Provides realistic sample data for UI development and testing
 * Used before backend is fully integrated
 */

import { ISheetsSync, SheetsSyncDraft, SheetsSyncResult, AccountChange } from './ISheetsSync';

/**
 * Sample account changes for testing
 * Uses Philippine Peso (PHP) as currency
 */
const SAMPLE_CHANGES: AccountChange[] = [
  {
    accountId: 'acc-001',
    accountName: 'Cash in Wallet',
    currentBalance: 15500.00,
    sheetBalance: 12350.75,
    currency: 'PHP',
    isNew: false,
    lastSyncTime: '2026-03-28T14:30:00Z',
  },
  {
    accountId: 'acc-002',
    accountName: 'BDO Checking',
    currentBalance: 125000.50,
    sheetBalance: 118500.00,
    currency: 'PHP',
    isNew: false,
    lastSyncTime: '2026-03-28T14:30:00Z',
  },
  {
    accountId: 'acc-003',
    accountName: 'Savings Account',
    currentBalance: 450000.00,
    sheetBalance: 445000.00,
    currency: 'PHP',
    isNew: false,
    lastSyncTime: '2026-03-28T14:30:00Z',
  },
  {
    accountId: 'acc-004',
    accountName: 'Business Account',
    currentBalance: 85000.00,
    sheetBalance: 0.00,
    currency: 'PHP',
    isNew: true,
    lastSyncTime: null,
  },
];

export class MockSheetsSyncClient implements ISheetsSync {
  private lastSyncTime: string | null = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
  private draftCache: Map<string, SheetsSyncDraft> = new Map();

  async createDraft(): Promise<SheetsSyncDraft> {
    const draft: SheetsSyncDraft = {
      draftId: `draft-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`,
      totalAccounts: 9,
      newAccounts: 1,
      updatedAccounts: 3,
      unchangedAccounts: 5,
      changes: SAMPLE_CHANGES,
      createdAt: new Date().toISOString(),
    };

    // Cache draft in memory (simulating backend storage)
    this.draftCache.set(draft.draftId, draft);

    return draft;
  }

  async executeSyncFromDraft(draftId: string): Promise<SheetsSyncResult> {
    const draft = this.draftCache.get(draftId);

    if (!draft) {
      throw new Error(`Draft not found: ${draftId}`);
    }

    // Simulate successful sync
    this.lastSyncTime = new Date().toISOString();
    this.draftCache.delete(draftId); // Remove draft after sync

    return {
      success: true,
      syncedAt: this.lastSyncTime,
      accountsUpdated: draft.updatedAccounts,
      accountsAdded: draft.newAccounts,
      message: `Successfully synced ${draft.updatedAccounts} accounts and added ${draft.newAccounts} new account(s)`,
    };
  }

  async hasPendingChanges(): Promise<boolean> {
    // Simulate 70% chance of pending changes
    return Math.random() > 0.3;
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.lastSyncTime;
  }
}
