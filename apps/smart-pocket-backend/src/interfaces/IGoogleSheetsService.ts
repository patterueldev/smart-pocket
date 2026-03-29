import { Amount } from './IActualBudgetService';

export interface GoogleSheetsConfig {
  credentialsPath: string;
  sheetId: string;
  sheetName?: string;
  currency?: string;
}

export interface SheetBalance {
  accountName: string;
  cleared: Amount;
  uncleared: Amount;
  lastSyncedAt?: string;
}

export interface UpdateResult {
  rowsUpdated: number;
  timestamp: string;
}

// Re-export Amount for consumers
export type { Amount };

export interface IGoogleSheetsService {
  getLastSyncedBalances(config: GoogleSheetsConfig): Promise<SheetBalance[]>;
  updateBalances(config: GoogleSheetsConfig, balances: SheetBalance[]): Promise<UpdateResult>;
}
