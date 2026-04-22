import type { DraftSummary } from './DraftSummary';
import type { PendingAccountChange } from './PendingAccountChange';

/**
 * Backend response for /sheets-sync/draft endpoint
 * Contains draft ID, summary stats, and pending changes
 */
export interface DraftResponse {
  success: boolean;
  draftId: string;
  summary: DraftSummary;
  pendingChanges: PendingAccountChange[];
  timestamp: string;
}
