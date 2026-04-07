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

export interface ISheetsSync {
  createDraft(
    actualBalances: AccountBalance[],
    sheetBalances: SheetBalance[],
    lastSyncedAt?: string
  ): Promise<Draft>;

  getDraft(draftId: string): Promise<Draft | null>;

  executeSyncFromDraft(draftId: string): Promise<SyncExecutionResult>;

  listDrafts(): Promise<Draft[]>;

  clearExpiredDrafts(): Promise<number>;
}
