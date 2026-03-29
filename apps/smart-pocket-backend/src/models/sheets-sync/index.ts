export interface CreateDraftRequest {
  actualBudgetServerUrl?: string;
  actualBudgetPassword?: string;
  actualBudgetId?: string;
}

export interface CreateDraftResponse {
  success: boolean;
  draftId: string;
  summary: {
    totalAccounts: number;
    newAccounts: number;
    updatedAccounts: number;
    unchangedAccounts: number;
  };
  pendingChanges: Array<{
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
  }>;
  timestamp: string;
  error?: string;
}

export interface ExecuteSyncRequest {
  draftId: string;
}

export interface ExecuteSyncResponse {
  success: boolean;
  syncedAt: string;
  accountsUpdated: number;
  message?: string;
  error?: string;
}
