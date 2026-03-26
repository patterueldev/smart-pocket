const api = require('@actual-app/api');
const { q, utils, aqlQuery } = api;

/**
 * ActualBudgetRepository
 * 
 * Data access layer for Actual Budget operations.
 * Encapsulates all fetch operations using ActualBudget instance.
 * 
 * Responsibilities:
 * - Query accounts, transactions, balances
 * - Transform raw data to expected format
 * - All fetch operations go through ActualBudget.withBudget()
 */
class ActualBudgetRepository {
  constructor(actualBudget) {
    if (!actualBudget) {
      throw new Error('ActualBudgetRepository requires an ActualBudget instance');
    }
    this.actualBudget = actualBudget;
  }

  /**
   * Get all accounts from Actual Budget
   * 
   * @returns {Promise<Array>} - List of accounts
   */
  async getAccounts() {
    return this.actualBudget.withBudget(async () => {
      const { data: accounts } = await aqlQuery(
        q('accounts').select('*')
      );
      return accounts;
    });
  }

  /**
   * Get active on-budget accounts with balances
   * 
   * Returns cleared and uncleared balances for all on-budget accounts.
   * Off-budget accounts (tracking accounts) are excluded.
   * 
   * @returns {Promise<Array<{ accountId: string, accountName: string, cleared: object, uncleared: object }>>}
   */
  async getAccountBalances() {
    return this.actualBudget.withBudget(async () => {
      // Step 1: Get all active, on-budget accounts
      const { data: accounts } = await aqlQuery(
        q('accounts')
          .select(['id', 'name', 'offbudget', 'closed'])
          .filter({
            closed: false,
            offbudget: false
          })
      );

      // Step 2: For each account, calculate cleared and uncleared balances
      const balances = await Promise.all(
        accounts.map(async (account) => {
          // Get all transactions for this account
          const { data: transactions } = await aqlQuery(
            q('transactions')
              .filter({ account: account.id })
              .select(['amount', 'cleared'])
              .options({ splits: 'inline' })
          );

          // Sum transactions by cleared status
          let clearedBalance = 0;
          let unclearedBalance = 0;

          transactions.forEach(txn => {
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
              currency: this.actualBudget.config.currency
            },
            uncleared: {
              amount: utils.integerToAmount(unclearedBalance).toFixed(2),
              currency: this.actualBudget.config.currency
            }
          };
        })
      );

      return balances;
    });
  }

  /**
   * Get transactions for an account within a date range
   * 
   * @param {string} accountId - Account ID
   * @param {string} sinceDate - Start date (YYYY-MM-DD)
   * @param {string} untilDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} - List of transactions
   */
  async getTransactions(accountId, sinceDate, untilDate) {
    return this.actualBudget.withBudget(async () => {
      const { data: transactions } = await aqlQuery(
        q('transactions')
          .filter({ account: accountId })
          .select('*')
          .options({ splits: 'inline' })
      );
      
      // Filter by date range
      return transactions.filter(txn => {
        return txn.date >= sinceDate && txn.date <= untilDate;
      });
    });
  }
}

module.exports = ActualBudgetRepository;
