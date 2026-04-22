import Logger from '../../utils/logger';
import { AccountBalance } from '../../interfaces/IActualBudgetService';
import { SheetBalance } from '../../interfaces/IGoogleSheetsService';
import {
  ISheetsSync,
  ISheetsSyncAdmin,
  Draft,
  PendingChange,
  SyncExecutionResult,
} from '../../interfaces/ISheetsSync';

const logger = new Logger();

/**
 * Generate a draft ID
 */
function generateDraftId(): string {
  return `draft-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
}

/**
 * Compare two amounts for equality
 */
function amountsEqual(a: string, b: string): boolean {
  return parseFloat(a) === parseFloat(b);
}

/**
 * Sheets Sync Service - Orchestrates sync between Actual Budget and Google Sheets
 * Handles draft creation, comparison logic, and sync execution
 * Implements both ISheetsSync (core) and ISheetsSyncAdmin (admin operations)
 */
class SheetsSyncService implements ISheetsSync, ISheetsSyncAdmin {
  private draftsStore: Map<string, Draft> = new Map();

  /**
   * Extract accounts with pending changes from a draft
   * Maps pending changes to their account details
   * @param draft The draft containing pending changes and all accounts
   * @returns Array of AccountBalance objects that have pending changes
   */
  getAccountsForSync(draft: Draft): AccountBalance[] {
    return draft.pendingChanges
      .map((change) => {
        return draft.allAccounts.find((a) => a.accountName === change.accountName);
      })
      .filter((account): account is AccountBalance => account !== undefined);
  }

  /**
   * Create a draft with pending changes
   * Compares Actual Budget balances with last synced values from Google Sheets
   */
  async createDraft(
    actualBalances: AccountBalance[],
    sheetBalances: SheetBalance[],
    lastSyncedAt?: string
  ): Promise<Draft> {
    logger.info('Creating sheets sync draft', {
      actualAccountCount: actualBalances.length,
      sheetAccountCount: sheetBalances.length,
    });

    // Create a map of sheet balances for easy lookup
    const sheetMap: Record<string, SheetBalance> = {};
    sheetBalances.forEach((balance) => {
      sheetMap[balance.accountName] = balance;
    });

    // Identify pending changes
    const pendingChanges: PendingChange[] = [];
    let newAccountCount = 0;
    let updatedAccountCount = 0;

    for (const actual of actualBalances) {
      const synced = sheetMap[actual.accountName];

      if (!synced) {
        // New account (exists in Actual but not in Sheets)
        pendingChanges.push({
          accountName: actual.accountName,
          type: 'NEW',
          cleared: {
            current: actual.cleared,
            synced: { amount: '0.00', currency: actual.cleared.currency },
          },
          uncleared: {
            current: actual.uncleared,
            synced: { amount: '0.00', currency: actual.uncleared.currency },
          },
        });
        newAccountCount++;
      } else if (
        !amountsEqual(actual.cleared.amount, synced.cleared.amount) ||
        !amountsEqual(actual.uncleared.amount, synced.uncleared.amount)
      ) {
        // Updated account (balance differs)
        pendingChanges.push({
          accountName: actual.accountName,
          type: 'UPDATE',
          cleared: {
            current: actual.cleared,
            synced: synced.cleared,
          },
          uncleared: {
            current: actual.uncleared,
            synced: synced.uncleared,
          },
        });
        updatedAccountCount++;
      }
    }

    // Create draft
    const draftId = generateDraftId();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h expiry

    const draft: Draft = {
      id: draftId,
      createdAt: now,
      expiresAt,
      pendingChanges,
      summary: {
        totalAccounts: actualBalances.length,
        newAccounts: newAccountCount,
        updatedAccounts: updatedAccountCount,
        unchangedAccounts: actualBalances.length - newAccountCount - updatedAccountCount,
      },
      lastSyncedAt,
      allAccounts: actualBalances,
    };

    // Store draft
    this.draftsStore.set(draftId, draft);

    logger.info('Created sheets sync draft', {
      draftId,
      totalAccounts: draft.summary.totalAccounts,
      newAccounts: newAccountCount,
      updatedAccounts: updatedAccountCount,
      unchangedAccounts: draft.summary.unchangedAccounts,
    });

    return draft;
  }

  /**
   * Retrieve a draft by ID
   */
  async getDraft(draftId: string): Promise<Draft | null> {
    const draft = this.draftsStore.get(draftId);

    if (!draft) {
      logger.warn('Draft not found', { draftId });
      return null;
    }

    if (new Date(draft.expiresAt) < new Date()) {
      logger.info('Draft has expired', { draftId });
      this.draftsStore.delete(draftId);
      return null;
    }

    return draft;
  }

  /**
   * Execute a draft and sync changes to Google Sheets
   * This is called after user approves the draft
   */
  async executeSyncFromDraft(draftId: string): Promise<SyncExecutionResult> {
    logger.info('Executing sync from draft', { draftId });

    const draft = await this.getDraft(draftId);

    if (!draft) {
      logger.warn('Cannot execute sync: draft not found', { draftId });
      return {
        success: false,
        syncedAt: new Date().toISOString(),
        accountsUpdated: 0,
        errorMessage: 'Draft not found or has expired',
      };
    }

    try {
      // Get accounts with pending changes using helper method
      const accountsToSync = this.getAccountsForSync(draft);

      logger.info('Syncing accounts to Google Sheets', {
        accountCount: accountsToSync.length,
      });

      // Note: Actual Google Sheets update happens in the controller/endpoint
      // This service just prepares the data and manages the draft lifecycle

      const now = new Date().toISOString();

      // Delete draft after successful sync
      this.draftsStore.delete(draftId);

      logger.info('Successfully executed sync from draft', {
        draftId,
        syncedAt: now,
        accountCount: accountsToSync.length,
      });

      return {
        success: true,
        syncedAt: now,
        accountsUpdated: accountsToSync.length,
        draftId,
      };
    } catch (error) {
      logger.warn('Error executing sync from draft', {
        errorMessage: error instanceof Error ? error.message : String(error),
        draftId,
      });

      return {
        success: false,
        syncedAt: new Date().toISOString(),
        accountsUpdated: 0,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * List all active drafts
   */
  async listDrafts(): Promise<Draft[]> {
    // Clear expired drafts first
    await this.clearExpiredDrafts();

    return Array.from(this.draftsStore.values());
  }

  /**
   * Clear expired drafts
   */
  async clearExpiredDrafts(): Promise<number> {
    const now = new Date();
    let clearedCount = 0;

    const idsToDelete: string[] = [];

    for (const [draftId, draft] of this.draftsStore.entries()) {
      if (new Date(draft.expiresAt) < now) {
        idsToDelete.push(draftId);
        clearedCount++;
      }
    }

    idsToDelete.forEach((draftId) => {
      this.draftsStore.delete(draftId);
    });

    if (clearedCount > 0) {
      logger.info('Cleared expired drafts', { count: clearedCount });
    }

    return clearedCount;
  }
}

export default SheetsSyncService;
