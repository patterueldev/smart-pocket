/**
 * Core Interfaces & Types
 */

export interface MoneyValue {
  amount: string;
  currency: string;
}

export interface AccountBalance {
  accountName: string;
  cleared: MoneyValue;
  uncleared?: MoneyValue;
}

export interface BalanceChange {
  type: 'NEW' | 'UPDATE';
  accountName: string;
  lastSyncedAt: string | null;
  cleared: {
    current: MoneyValue;
    synced: MoneyValue;
  } | null;
  uncleared: {
    current: MoneyValue;
    synced: MoneyValue;
  } | null;
}

export interface SyncDraftSummary {
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
  unchangedAccounts: number;
}

export interface SyncDraft {
  id: string;
  createdAt: string;
  pendingChanges: BalanceChange[];
  allAccounts: AccountBalance[];
  lastSyncedAt: string | null;
  summary: SyncDraftSummary;
}

export interface SyncResult {
  success: boolean;
  draftId: string;
  syncedAt: string;
  accountsSynced: number;
  rowsWritten: number;
}

/**
 * Service Interfaces (SOLID: Dependency Inversion)
 */

export interface IGoogleSheetsService {
  /**
   * Get draft of pending sync changes
   * 
   * Compares Actual Budget balances with last synced values
   * 
   * @returns Draft with pending changes or null if all synced
   */
  getSyncDraft(): Promise<SyncDraft | null>;
  
  /**
   * Execute sync to Google Sheets
   * 
   * Updates spreadsheet with current account balances
   * 
   * @param draftId - Draft ID from getSyncDraft()
   * @returns Sync result with updated accounts
   */
  approveSyncDraft(draftId: string): Promise<SyncResult>;
}

export interface IDraftStore {
  /**
   * Store a draft
   */
  set(id: string, draft: SyncDraft): void;
  
  /**
   * Retrieve a draft by ID
   */
  get(id: string): SyncDraft | null;
  
  /**
   * Delete a draft by ID
   */
  delete(id: string): void;
  
  /**
   * Clear all stored drafts
   */
  clear(): void;
}

/**
 * HTTP Request/Response Types
 */

export interface HttpRequest {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  query?: Record<string, string>;
}

export interface HttpResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
