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
 * Falls back to using directory name if metadata.json is missing or empty
 */
function refreshSyncIdToBudgetIdMap(dataDir: string): Record<string, string> {
  const syncIdToBudgetIdMap: Record<string, string> = {};
  try {
    if (!fs.existsSync(dataDir)) {
      logger.debug('Cache directory does not exist', { dataDir });
      return syncIdToBudgetIdMap;
    }

    const files = fs.readdirSync(dataDir);
    logger.debug('Cache directory contents', { dataDir, files });
    
    const budgetDirs = files.filter((file) => {
      const fullPath = path.join(dataDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    logger.debug('Found budget directories', { budgetDirs });

    budgetDirs.forEach((budgetId) => {
      const metadataPath = path.join(dataDir, budgetId, 'metadata.json');
      let foundMapping = false;

      if (fs.existsSync(metadataPath)) {
        try {
          const content = fs.readFileSync(metadataPath, 'utf8');
          logger.debug('Metadata file content', { budgetId, contentLength: content.length });
          
          // Skip empty metadata files
          if (content.trim().length > 0) {
            const metadata = JSON.parse(content);
            if (metadata.cloudFileId) {
              syncIdToBudgetIdMap[metadata.cloudFileId] = budgetId;
              logger.debug('Mapped budget from metadata', {
                cloudFileId: metadata.cloudFileId,
                budgetId,
              });
              foundMapping = true;
            }
          }
        } catch (parseError) {
          logger.debug('Failed to parse metadata.json', {
            budgetId,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }

      // Fallback: if no valid metadata, just use the directory name
      // The @actual-app/api writes empty metadata sometimes, but the budget is still usable
      if (!foundMapping) {
        // For now, just log that we found the directory but couldn't map it
        logger.debug('Budget directory found but cannot map via metadata', { budgetId });
      }
    });

    logger.debug('Refreshed budget cache map', {
      budgetCount: Object.keys(syncIdToBudgetIdMap).length,
      mappings: syncIdToBudgetIdMap,
    });
  } catch (error) {
    logger.warn('Failed to refresh budget cache map', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return syncIdToBudgetIdMap;
}

/**
 * Ensure budget is loaded before performing operations
 * Always downloads fresh data - no caching
 */
async function ensureBudgetLoaded(config: ActualBudgetConfig): Promise<void> {
  const { serverUrl, password, budgetId: syncId, dataDir } = config;

  // Use persistent cache but clear old data before each download
  const cacheDir = dataDir || '/tmp/actual-cache';
  
  // Clear cache directory to force fresh download
  if (fs.existsSync(cacheDir)) {
    try {
      const files = fs.readdirSync(cacheDir);
      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      logger.debug('Cleared cache directory for fresh download', { cacheDir });
    } catch (clearErr) {
      logger.warn('Failed to clear cache directory', {
        error: clearErr instanceof Error ? clearErr.message : String(clearErr),
      });
    }
  }

  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Initialize API
  const initConfig: { dataDir: string; serverURL: string; password?: string } = {
    dataDir: cacheDir,
    serverURL: serverUrl,
  };

  if (password) {
    initConfig.password = password;
  }

  await api.init(initConfig);

  // Always download fresh data
  logger.debug('Downloading budget from server (no caching)', { syncId });
  try {
    await api.downloadBudget(syncId);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // Provide helpful guidance if download fails
    if (errorMsg.includes('not found') || errorMsg.includes('sync id')) {
      const helpfulError = new Error(
        `Budget sync failed: "${syncId}" not found on server. ` +
        `Verify ACTUAL_BUDGET_ID is set to the Sync ID from your budget's Settings > Advanced page. ` +
        `Original error: ${errorMsg}`
      );
      logger.error('Budget download failed - invalid Sync ID', helpfulError);
      throw helpfulError;
    }
    
    // Check for migration mismatch errors
    if (errorMsg.includes('out-of-sync-migrations') || errorMsg.includes('Database is out of sync')) {
      const helpfulError = new Error(
        `Budget download successful but database schema mismatch detected. ` +
        `Your Actual Budget server version may not be compatible with this API client (@actual-app/api@26.5.0-nightly.20260418). ` +
        `Please verify your server version or try updating the API package. ` +
        `Original error: ${errorMsg}`
      );
      logger.error('Budget migration mismatch', helpfulError);
      throw helpfulError;
    }
    
    throw error;
  }

  // Load the freshly downloaded budget - use the first directory found in cache
  // since metadata.json may be empty/corrupted due to @actual-app/api limitations
  const budgetDirs = fs.readdirSync(cacheDir).filter((file) => {
    const fullPath = path.join(cacheDir, file);
    return fs.statSync(fullPath).isDirectory();
  });

  if (budgetDirs.length === 0) {
    logger.warn('No budget directories found after download', { syncId, cacheDir });
    throw new Error(
      `Failed to locate downloaded budget for ${syncId}. ` +
      `Check that ACTUAL_BUDGET_ID is the correct Sync ID from your budget's Settings > Advanced.`
    );
  }

  // Use the first (and likely only) budget directory name as fallback
  // Note: This is a directory name, not the sync ID, due to metadata.json corruption
  const budgetDirName = budgetDirs[0];
  logger.debug('Loading downloaded budget from directory', { syncId, budgetDirName, cacheDir });
  await api.loadBudget(budgetDirName);
  await api.sync();
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
    } else if (error && typeof error === 'object') {
      // For plain objects, preserve the original object structure in error message
      const err = error as Record<string, unknown>;
      const message = err.message ? String(err.message) : JSON.stringify(error);
      const apiError = new Error(message);
      // Attach the original error object to the Error for later inspection
      Object.assign(apiError, error);
      throw apiError;
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
