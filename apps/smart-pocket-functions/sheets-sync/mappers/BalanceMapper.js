const api = require('@actual-app/api');
const { utils } = api;

/**
 * BalanceMapper
 * 
 * Responsible for transforming raw transaction data into balance objects.
 * Single Responsibility: Data transformation only, no query logic.
 */
class BalanceMapper {
  /**
   * Calculate cleared and uncleared balances from transactions
   * 
   * @param {Array} transactions - List of transactions with amount and cleared fields
   * @param {string} currency - Currency code
   * @returns {Object} - { cleared, uncleared } balance objects
   */
  static calculateBalances(transactions, currency) {
    let clearedBalance = 0;
    let unclearedBalance = 0;

    transactions.forEach(txn => {
      if (txn.cleared) {
        clearedBalance += txn.amount;
      } else {
        unclearedBalance += txn.amount;
      }
    });

    return {
      cleared: {
        amount: utils.integerToAmount(clearedBalance).toFixed(2),
        currency
      },
      uncleared: {
        amount: utils.integerToAmount(unclearedBalance).toFixed(2),
        currency
      }
    };
  }

  /**
   * Transform account with balance data into output format
   * 
   * @param {Object} account - Account object with id and name
   * @param {Object} balances - Balance object from calculateBalances
   * @returns {Object} - Transformed account with balances
   */
  static mapAccountWithBalances(account, balances) {
    return {
      accountId: account.id,
      accountName: account.name,
      ...balances
    };
  }
}

module.exports = BalanceMapper;
