import type { AccountBalance } from './AccountBalance';

/**
 * Represents a pending account change in a sync draft
 * Tracks the difference between current Actual Budget balances and previously synced values
 */
export interface PendingAccountChange {
  accountName: string;
  type: 'NEW' | 'UPDATE';
  cleared: AccountBalance;
  uncleared: AccountBalance;
}
