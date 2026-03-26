const { AccountQueries, TransactionQueries } = require('../queries');
const { BalanceMapper } = require('../mappers');

/**
 * ActualBudgetRepository
 * 
 * Repository pattern implementation for Actual Budget.
 * Orchestrates queries and mappers to provide clean data access API.
 * 
 * SOLID principles applied:
 * - Single Responsibility: Orchestrates data access (queries handled by Query classes)
 * - Open/Closed: Easy to add new repository methods without modifying existing ones
 * - Interface Segregation: Clients depend on repository interface, not implementation details
 * - Dependency Inversion: Depends on Query abstractions, not direct API calls
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
      return AccountQueries.getAllAccounts();
    });
  }

  /**
   * Get active on-budget accounts with cleared/uncleared balances
   * 
   * @returns {Promise<Array>} - List of accounts with balance information
   */
  async getAccountBalances() {
    return this.actualBudget.withBudget(async () => {
      // Step 1: Query active on-budget accounts
      const accounts = await AccountQueries.getActiveBudgetAccounts();

      // Step 2: For each account, calculate balances
      const balances = await Promise.all(
        accounts.map(async (account) => {
          const transactions = await TransactionQueries.getAccountBalanceData(account.id);
          const balanceData = BalanceMapper.calculateBalances(
            transactions,
            this.actualBudget.config.currency
          );
          return BalanceMapper.mapAccountWithBalances(account, balanceData);
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
      const transactions = await TransactionQueries.getAccountTransactions(accountId);
      
      return transactions.filter(txn => {
        return txn.date >= sinceDate && txn.date <= untilDate;
      });
    });
  }
}

module.exports = ActualBudgetRepository;
