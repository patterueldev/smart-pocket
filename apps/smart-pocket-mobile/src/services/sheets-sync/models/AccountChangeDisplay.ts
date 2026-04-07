import { PendingAccountChange } from './PendingAccountChange';

/**
 * Display model for account changes
 * Transforms PendingAccountChange to a format suitable for UI components
 * Calculates total cleared + uncleared balances for display
 */
export interface AccountChangeDisplay extends PendingAccountChange {
  accountId?: string; // Optional for backward compatibility
  currentBalance: number; // Total of cleared + uncleared current amounts
  sheetBalance: number; // Total of cleared + uncleared synced amounts
  currency: string;
  isNew: boolean; // true if type is 'NEW'
  lastSyncTime: string | null; // Not provided by backend, but kept for schema completeness
}

/**
 * Transform a PendingAccountChange to AccountChangeDisplay for rendering
 * Sums up cleared and uncleared balances for the UI
 */
export function transformToDisplayModel(
  change: PendingAccountChange,
  currency?: string
): AccountChangeDisplay {
  const clearedCurrent = parseFloat(change.cleared.current.amount);
  const unclearedCurrent = parseFloat(change.uncleared.current.amount);
  const clearedSynced = parseFloat(change.cleared.synced.amount);
  const unclearedSynced = parseFloat(change.uncleared.synced.amount);

  return {
    ...change,
    currentBalance: clearedCurrent + unclearedCurrent,
    sheetBalance: clearedSynced + unclearedSynced,
    currency: currency || change.cleared.current.currency,
    isNew: change.type === 'NEW',
    lastSyncTime: null,
  };
}
