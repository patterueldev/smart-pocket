/**
 * Summary statistics for a sheets sync draft
 */
export interface DraftSummary {
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
  unchangedAccounts: number;
}
