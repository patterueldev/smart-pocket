const SecretsLoader = require('./SecretsLoader');

/**
 * ConfigLoader
 * 
 * Responsible for loading and validating configuration for ActualBudget.
 * Orchestrates secrets loading and provides a clean config object.
 * 
 * SOLID principles:
 * - Single Responsibility: Loads and validates configuration
 * - Dependency Inversion: Depends on SecretsLoader abstraction
 * - Open/Closed: Easy to add new config sources without modifying existing code
 */
class ConfigLoader {
  constructor(secretsLoader = null) {
    this.secretsLoader = secretsLoader || new SecretsLoader();
  }

  /**
   * Load configuration for ActualBudget
   * 
   * @returns {Object} - Configuration object with serverURL, password, budgetId, currency
   * @throws {Error} - If required configuration is missing
   */
  loadConfig() {
    const config = {
      serverURL: this.loadServerURL(),
      password: this.loadPassword(),
      budgetId: this.loadBudgetId(),
      currency: this.loadCurrency()
    };

    this.validateConfig(config);
    return config;
  }

  /**
   * Load server URL (optional, has default)
   */
  loadServerURL() {
    try {
      return this.secretsLoader.getSecret('actual-budget-server-url');
    } catch (err) {
      // Server URL is optional, use default
      return process.env.ACTUAL_BUDGET_SERVER_URL || 'http://localhost:5006';
    }
  }

  /**
   * Load password (required)
   */
  loadPassword() {
    return this.secretsLoader.getSecret('actual-budget-password', 'ACTUAL_BUDGET_PASSWORD');
  }

  /**
   * Load budget ID/sync ID (required)
   */
  loadBudgetId() {
    return this.secretsLoader.getSecret('actual-budget-sync-id', 'ACTUAL_BUDGET_ID');
  }

  /**
   * Load currency (optional, has default)
   */
  loadCurrency() {
    try {
      return this.secretsLoader.getSecret('actual-budget-currency');
    } catch (err) {
      // Currency is optional, use default
      return process.env.ACTUAL_BUDGET_CURRENCY || 'USD';
    }
  }

  /**
   * Validate that all required configuration is present
   * 
   * @param {Object} config - Configuration object to validate
   * @throws {Error} - If required config is missing
   */
  validateConfig(config) {
    const required = ['password', 'budgetId'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(', ')}. ` +
        `Ensure these are set as secrets or environment variables.`
      );
    }
  }
}

module.exports = ConfigLoader;
