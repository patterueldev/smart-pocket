import * as fs from 'fs';
import * as path from 'path';
import Logger from '../utils/logger';
import {
  IActualBudgetService,
  ActualBudgetConfig,
  AccountBalance,
  Account,
  Transaction,
} from '../interfaces/IActualBudgetService';

interface ActualAppApi {
  init(config: { dataDir: string; serverURL: string; password?: string }): Promise<void>;
  downloadBudget(syncId: string): Promise<void>;
  loadBudget(budgetId: string): Promise<void>;
  sync(): Promise<void>;
  shutdown(): Promise<void>;
}

interface QueryBuilder {
  select(fields: string | string[]): QueryBuilder;
  filter(conditions: Record<string, unknown>): QueryBuilder;
  options(opts: Record<string, unknown>): QueryBuilder;
}

interface QueryResult<T> {
  data: T[];
}

interface ActualAppApiModule {
  q: (table: string) => QueryBuilder;
  aqlQuery: (query: QueryBuilder) => Promise<QueryResult<unknown>>;
  utils: {
    integerToAmount: (cents: number) => number;
  };
}

let api: ActualAppApi;
let actualAppApi: ActualAppApiModule;

// Cache mapping: syncId → budgetId for faster subsequent loads
const syncIdToBudgetIdMap: Record<string, string> = {};

const logger = new Logger();

/**
 * Lazy load the @actual-app/api module
 */
function loadActualApi(): ActualAppApiModule {
  if (!actualAppApi) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const apiModule = require('@actual-app/api');
    actualAppApi = apiModule;
    api = apiModule;
  }
  return actualAppApi;
}

/**
 * Refresh the syncId → budgetId mapping by scanning the data directory
 */
function refreshSyncIdToBudgetIdMap(dataDir: string): void {
  try {
    if (!fs.existsSync(dataDir)) {
      return;
    }

    const files = fs.readdirSync(dataDir);
    const budgetDirs = files.filter((file) => {
      const fullPath = path.join(dataDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    budgetDirs.forEach((budgetId) => {
      const metadataPath = path.join(dataDir, budgetId, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (metadata.cloudFileId) {
          syncIdToBudgetIdMap[metadata.cloudFileId] = budgetId;
        }
      }
    });

    logger.debug('Refreshed budget cache map', {
      budgetCount: Object.keys(syncIdToBudgetIdMap).length,
    });
  } catch (error) {
    logger.warn('Failed to refresh budget cache map', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Ensure budget is loaded before performing operations
 */
async function ensureBudgetLoaded(config: ActualBudgetConfig): Promise<void> {
  const { serverUrl, password, budgetId: syncId, dataDir } = config;

  // Ensure data directory exists
  const cacheDir = dataDir || '/tmp/actual-cache';
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Initialize API if not already
  const initConfig: { dataDir: string; serverURL: string; password?: string } = {
    dataDir: cacheDir,
    serverURL: serverUrl,
  };

  if (password) {
    initConfig.password = password;
  }

  await api.init(initConfig);

  // Check if we've downloaded this budget before
  if (syncId in syncIdToBudgetIdMap) {
    // Budget exists locally, just load it
    logger.debug('Loading budget from cache', { syncId });
    await api.loadBudget(syncIdToBudgetIdMap[syncId]);
    await api.sync();
  } else {
    // First time - download from server
    logger.debug('Downloading budget from server', { syncId });
    await api.downloadBudget(syncId);

    // Update cache map by scanning the data directory
    refreshSyncIdToBudgetIdMap(cacheDir);
  }
}

/**
 * Wrapper for all Actual Budget operations
 * Ensures budget is loaded before operation and cleaned up after
 */
async function withBudget<T>(config: ActualBudgetConfig, operation: () => Promise<T>): Promise<T> {
  try {
    await ensureBudgetLoaded(config);
    const result = await operation();
    // Shutdown asynchronously without waiting
    api.shutdown().catch(err => {
      const error = err instanceof Error ? err.message : String(err);
      logger.warn('Error shutting down Actual Budget', { error });
    });
    return result;
  } catch (error) {
    // Shutdown asynchronously without waiting
    api.shutdown().catch(shutdownErr => {
      const shutdownError = shutdownErr instanceof Error ? shutdownErr.message : String(shutdownErr);
      logger.warn('Error shutting down Actual Budget during error cleanup', { error: shutdownError });
    });
    // Convert non-Error objects to Error before throwing
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
}

/**
 * Actual Budget Service for Smart Pocket
 * Provides integration with Actual Budget via @actual-app/api
 */
class ActualBudgetService implements IActualBudgetService {
  constructor() {
    loadActualApi();
  }

  async getAccountBalances(config: ActualBudgetConfig): Promise<AccountBalance[]> {
    return withBudget(config, async () => {
      const apiModule = loadActualApi();
      const { q, aqlQuery, utils } = apiModule;

      logger.info('Fetching account balances from Actual Budget');

      // Step 1: Get all active, on-budget accounts
      // Note: Use boolean true/false, not integers 0/1
      const accountsResult = (await aqlQuery(
        q('accounts').select(['id', 'name', 'offbudget', 'closed']).filter({
          closed: false,
          offbudget: false,
        })
      )) as QueryResult<Account>;

      const accounts = accountsResult.data;
      logger.info(`Found ${accounts.length} active on-budget accounts`);

      // Step 2: For each account, calculate cleared and uncleared balances
      const balances = await Promise.all(
        accounts.map(async (account) => {
          // Get all transactions for this account
          const txnResult = (await aqlQuery(
            q('transactions')
              .filter({ account: account.id })
              .select(['amount', 'cleared'])
              .options({ splits: 'inline' })
          )) as QueryResult<Transaction>;

          const transactions = txnResult.data;

          // Sum transactions by cleared status
          let clearedBalance = 0;
          let unclearedBalance = 0;

          transactions.forEach((txn) => {
            if (txn.cleared) {
              clearedBalance += txn.amount;
            } else {
              unclearedBalance += txn.amount;
            }
          });

          // Convert from cents to dollars and format as price objects
          return {
            accountId: account.id,
            accountName: account.name,
            cleared: {
              amount: utils.integerToAmount(clearedBalance).toFixed(2),
              currency: config.currency || 'USD',
            },
            uncleared: {
              amount: utils.integerToAmount(unclearedBalance).toFixed(2),
              currency: config.currency || 'USD',
            },
          };
        })
      );

      logger.info(`Calculated balances for ${balances.length} accounts`);
      return balances;
    });
  }

  async getAccounts(config: ActualBudgetConfig): Promise<Account[]> {
    return withBudget(config, async () => {
      const apiModule = loadActualApi();
      const { q, aqlQuery } = apiModule;

      const result = (await aqlQuery(
        q('accounts').select(['id', 'name', 'offbudget', 'closed']).filter({
          closed: false,
          offbudget: false,
        })
      )) as QueryResult<Account>;

      return result.data;
    });
  }

  async getTransactions(
    config: ActualBudgetConfig,
    accountId: string,
    sinceDate: string,
    untilDate: string
  ): Promise<Transaction[]> {
    return withBudget(config, async () => {
      const apiModule = loadActualApi();
      const { q, aqlQuery } = apiModule;

      const result = (await aqlQuery(
        q('transactions').filter({ account: accountId }).select('*').options({ splits: 'inline' })
      )) as QueryResult<Transaction>;

      const transactions = result.data;

      // Filter by date range
      return transactions.filter((txn) => txn.date >= sinceDate && txn.date <= untilDate);
    });
  }
}

export default ActualBudgetService;
