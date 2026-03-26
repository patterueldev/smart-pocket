const api = require('@actual-app/api');
const { q, aqlQuery } = api;

/**
 * AccountQueries
 * 
 * Responsible for querying accounts from Actual Budget.
 * Single Responsibility: Query logic only, no transformation.
 */
class AccountQueries {
  /**
   * Get all accounts
   * 
   * @returns {Promise<Array>}
   */
  static async getAllAccounts() {
    const { data: accounts } = await aqlQuery(
      q('accounts').select('*')
    );
    return accounts;
  }

  /**
   * Get active on-budget accounts
   * 
   * @returns {Promise<Array>}
   */
  static async getActiveBudgetAccounts() {
    const { data: accounts } = await aqlQuery(
      q('accounts')
        .select(['id', 'name', 'offbudget', 'closed'])
        .filter({
          closed: false,
          offbudget: false
        })
    );
    return accounts;
  }
}

module.exports = AccountQueries;
