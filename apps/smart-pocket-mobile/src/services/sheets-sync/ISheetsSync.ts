/**
 * Google Sheets Sync Service Interface
 * Defines contract for syncing Actual Budget accounts with Google Sheets
 */

/**
 * Account change in a sync draft
 */
export interface AccountChange {
  accountId?: string;
  accountName: string;
  currentBalance: number; // Current balance in Actual Budget
  sheetBalance: number; // Balance currently in Google Sheets
  currency: string; // Currency code (e.g., 'USD', 'PHP')
  isNew: boolean; // true if account is new in Google Sheets
  lastSyncTime: string | null; // ISO timestamp of last sync
}

/**
 * Sheets sync draft - created by /draft endpoint, approved via /sync endpoint
 */
export interface SheetsSyncDraft {
  draftId: string;
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
  unchangedAccounts: number;
  changes: AccountChange[];
  createdAt: string;
  lastSyncTime?: string | null; // Last time any account was synced
}

/**
 * Result of executing a sync
 */
export interface SheetsSyncResult {
  success: boolean;
  syncedAt: string;
  accountsUpdated: number;
  accountsAdded: number;
  message: string;
}

/**
 * Sheets sync service interface
 * Abstracts API calls to backend sheets-sync endpoints
 */
export interface ISheetsSync {
  /**
   * Create a draft of pending changes
   * @returns Promise with draft containing pending changes
   */
  createDraft(): Promise<SheetsSyncDraft>;

  /**
   * Execute sync based on a draft
   * @param draftId - ID of the draft to sync
   * @returns Promise with sync result
   */
  executeSyncFromDraft(draftId: string): Promise<SheetsSyncResult>;

  /**
   * Check if sync is available (has pending changes)
   * @returns Promise with boolean indicating if changes are pending
   */
  hasPendingChanges(): Promise<boolean>;

  /**
   * Get last sync timestamp
   * @returns Promise with ISO string timestamp or null if never synced
   */
  getLastSyncTime(): Promise<string | null>;
}
