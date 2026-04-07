export interface ActualBudgetConfig {
  serverUrl: string;
  budgetId: string;
  password?: string;
  dataDir?: string;
  currency?: string;
}

export interface Amount {
  amount: string;
  currency: string;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  cleared: Amount;
  uncleared: Amount;
}

export interface Account {
  id: string;
  name: string;
  offbudget: boolean;
  closed: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  cleared: boolean;
  account: string;
  [key: string]: unknown;
}

export interface IActualBudgetService {
  getAccountBalances(config: ActualBudgetConfig): Promise<AccountBalance[]>;
  getAccounts(config: ActualBudgetConfig): Promise<Account[]>;
  getTransactions(
    config: ActualBudgetConfig,
    accountId: string,
    sinceDate: string,
    untilDate: string
  ): Promise<Transaction[]>;
}
