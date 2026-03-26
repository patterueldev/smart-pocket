const api = require('@actual-app/api');

/**
 * ActualBudget Service
 * 
 * Wraps @actual-app/api library with initialization and budget loading logic.
 * Handles the pattern: init → download/load budget → perform operation → shutdown
 * 
 * Note: Designed for serverless/FaaS - no persistent file caching (stateless).
 * Each invocation downloads budget from server.
 * 
 * Responsibilities:
 * - API initialization with config
 * - Budget loading from server
 * - Budget shutdown
 * - withBudget wrapper for clean operation handling
 */
class ActualBudget {
  constructor(config = {}) {
    this.config = {
      serverURL: config.serverURL || 'http://localhost:5006',
      password: config.password,
      budgetId: config.budgetId, // syncId
      currency: config.currency || 'USD',
      ...config
    };
    
    // Cache mapping: syncId → budgetId (in-memory only)
    this.syncIdToBudgetIdMap = {};
    this.isInitialized = false;
  }

  /**
   * Initialize API with config
   * For FaaS, uses system temp directory (ephemeral)
   */
  async init() {
    if (this.isInitialized) return;

    // Initialize API without persistent data directory
    // API will use system temp automatically
    const initConfig = {
      serverURL: this.config.serverURL,
    };

    if (this.config.password) {
      initConfig.password = this.config.password;
    }

    await api.init(initConfig);
    this.isInitialized = true;
  }

  /**
   * Ensure budget is loaded before performing operations
   * Uses cache if available, otherwise downloads from server
   */
  async ensureBudgetLoaded() {
    await this.init();

    const syncId = this.config.budgetId;

    // Check if we've downloaded this budget before
    if (syncId in this.syncIdToBudgetIdMap) {
      // Budget exists locally, just load it
      await api.loadBudget(this.syncIdToBudgetIdMap[syncId]);
      await api.sync();
    } else {
      // First time - download from server
      await api.downloadBudget(syncId);
      
      // Update cache map by scanning the data directory
      this.refreshSyncIdToBudgetIdMap();
    }
  }

  /**
   * Refresh the syncId → budgetId mapping
   * For FaaS, this is in-memory only (no persistence)
   */
  refreshSyncIdToBudgetIdMap() {
    // In serverless, we don't persist to filesystem
    // In-memory map is reset on each invocation
    // This is acceptable as each invocation downloads fresh budget
  }

  /**
   * Shutdown API
   */
  async shutdown() {
    if (this.isInitialized) {
      await api.shutdown();
      this.isInitialized = false;
    }
  }

  /**
   * Execute operation with loaded budget
   * Ensures budget is loaded before operation and cleaned up after
   */
  async withBudget(operation) {
    try {
      await this.ensureBudgetLoaded();
      const result = await operation();
      await this.shutdown();
      return result;
    } catch (error) {
      await this.shutdown();
      throw error;
    }
  }
}

module.exports = ActualBudget;
