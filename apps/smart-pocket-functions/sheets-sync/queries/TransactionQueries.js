const api = require('@actual-app/api');
const { q, aqlQuery } = api;

/**
 * TransactionQueries
 * 
 * Responsible for querying transactions from Actual Budget.
 * Single Responsibility: Query logic only, no transformation.
 */
class TransactionQueries {
  /**
   * Get all transactions for an account
   * 
   * @param {string} accountId - Account ID
   * @returns {Promise<Array>}
   */
  static async getAccountTransactions(accountId) {
    const { data: transactions } = await aqlQuery(
      q('transactions')
        .filter({ account: accountId })
        .select('*')
        .options({ splits: 'inline' })
    );
    return transactions;
  }

  /**
   * Get transaction amounts for balance calculation (cleared status only)
   * 
   * @param {string} accountId - Account ID
   * @returns {Promise<Array>}
   */
  static async getAccountBalanceData(accountId) {
    const { data: transactions } = await aqlQuery(
      q('transactions')
        .filter({ account: accountId })
        .select(['amount', 'cleared'])
        .options({ splits: 'inline' })
    );
    return transactions;
  }
}

module.exports = TransactionQueries;
