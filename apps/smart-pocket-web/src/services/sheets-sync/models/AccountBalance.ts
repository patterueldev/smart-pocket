import type { BalanceSnapshot } from './BalanceSnapshot';

/**
 * Represents cleared and uncleared balance states for an account
 */
export interface AccountBalance {
  current: BalanceSnapshot;
  synced: BalanceSnapshot;
}
