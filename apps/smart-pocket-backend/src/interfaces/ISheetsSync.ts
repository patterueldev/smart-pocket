import { AccountBalance } from './IActualBudgetService';
import { SheetBalance } from './IGoogleSheetsService';

export interface PendingChange {
  accountName: string;
  type: 'NEW' | 'UPDATE';
  cleared: {
    current: { amount: string; currency: string };
    synced: { amount: string; currency: string };
  };
  uncleared: {
    current: { amount: string; currency: string };
    synced: { amount: string; currency: string };
  };
}

export interface DraftSummary {
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
  unchangedAccounts: number;
}

export interface Draft {
  id: string;
  createdAt: string;
  expiresAt: string;
  pendingChanges: PendingChange[];
  summary: DraftSummary;
  lastSyncedAt?: string;
  allAccounts: AccountBalance[];
}

export interface SyncExecutionResult {
  success: boolean;
  syncedAt: string;
  accountsUpdated: number;
  draftId?: string;
  errorMessage?: string;
}

/**
 * Core sync interface - used by SheetsSyncController
 * Handles draft creation, retrieval, and sync execution
 */
export interface ISheetsSync {
  createDraft(
    actualBalances: AccountBalance[],
    sheetBalances: SheetBalance[],
    lastSyncedAt?: string
  ): Promise<Draft>;

  getDraft(draftId: string): Promise<Draft | null>;

  executeSyncFromDraft(draftId: string): Promise<SyncExecutionResult>;

  /**
   * Get accounts with pending changes from a draft
   * Used by controller to convert to sheet format before updating
   */
  getAccountsForSync(draft: Draft): AccountBalance[];
}

/**
 * Admin interface - optional management operations
 * Not required for core controller functionality
 * Available for future admin dashboards or cleanup tasks
 */
export interface ISheetsSyncAdmin {
  listDrafts(): Promise<Draft[]>;

  clearExpiredDrafts(): Promise<number>;
}
