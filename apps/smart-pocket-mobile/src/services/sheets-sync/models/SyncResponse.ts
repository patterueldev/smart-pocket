/**
 * Backend response for /sheets-sync/sync endpoint
 * Contains result of executing a sync operation
 */
export interface SyncResponse {
  success: boolean;
  syncedAt: string;
  accountsUpdated: number;
  accountsAdded: number;
  message: string;
}
