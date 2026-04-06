/**
 * Mock Google Sheets Sync Client
 * Provides realistic sample data for UI development and testing
 * Used before backend is fully integrated
 */

import { ISheetsSync, SheetsSyncDraft, SheetsSyncResult } from './ISheetsSync';
import { transformToDisplayModel } from './models';

/**
 * Sample pending account changes matching backend response structure
 * Uses Philippine Peso (PHP) as currency
 */
const SAMPLE_PENDING_CHANGES = [
  {
    accountName: 'Cash in Wallet',
    type: 'UPDATE' as const,
    cleared: {
      current: { amount: '10000.00', currency: 'PHP' },
      synced: { amount: '8000.00', currency: 'PHP' },
    },
    uncleared: {
      current: { amount: '5500.00', currency: 'PHP' },
      synced: { amount: '4350.75', currency: 'PHP' },
    },
  },
  {
    accountName: 'BDO Checking',
    type: 'UPDATE' as const,
    cleared: {
      current: { amount: '100000.50', currency: 'PHP' },
      synced: { amount: '95000.00', currency: 'PHP' },
    },
    uncleared: {
      current: { amount: '25000.00', currency: 'PHP' },
      synced: { amount: '23500.00', currency: 'PHP' },
    },
  },
  {
    accountName: 'Savings Account',
    type: 'UPDATE' as const,
    cleared: {
      current: { amount: '400000.00', currency: 'PHP' },
      synced: { amount: '395000.00', currency: 'PHP' },
    },
    uncleared: {
      current: { amount: '50000.00', currency: 'PHP' },
      synced: { amount: '50000.00', currency: 'PHP' },
    },
  },
  {
    accountName: 'Business Account',
    type: 'NEW' as const,
    cleared: {
      current: { amount: '85000.00', currency: 'PHP' },
      synced: { amount: '0.00', currency: 'PHP' },
    },
    uncleared: {
      current: { amount: '0.00', currency: 'PHP' },
      synced: { amount: '0.00', currency: 'PHP' },
    },
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
      changes: SAMPLE_PENDING_CHANGES.map((change) => transformToDisplayModel(change)),
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
