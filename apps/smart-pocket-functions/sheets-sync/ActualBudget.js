const api = require('@actual-app/api');
const fs = require('fs');
const path = require('path');

/**
 * ActualBudget Service
 * 
 * Wraps @actual-app/api library with initialization and budget loading logic.
 * Handles the pattern: init → download/load budget → perform operation → shutdown
 * 
 * Responsibilities:
 * - API initialization with config
 * - Budget loading (from cache or server download)
 * - Budget shutdown
 * - withBudget wrapper for clean operation handling
 */
class ActualBudget {
  constructor(config = {}) {
    this.config = {
      dataDir: config.dataDir || '/tmp/actual-cache',
      serverURL: config.serverURL || 'http://localhost:5006',
      password: config.password,
      budgetId: config.budgetId, // syncId
      currency: config.currency || 'USD',
      ...config
    };
    
    // Cache mapping: syncId → budgetId for faster subsequent loads
    this.syncIdToBudgetIdMap = {};
    this.isInitialized = false;
  }

  /**
   * Initialize API with config
   * Creates cache directory if needed
   */
  async init() {
    if (this.isInitialized) return;

    // Ensure data directory exists
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }

    // Initialize API
    const initConfig = {
      dataDir: this.config.dataDir,
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
   * Refresh the syncId → budgetId mapping by scanning the data directory
   */
  refreshSyncIdToBudgetIdMap() {
    try {
      const files = fs.readdirSync(this.config.dataDir);
      const budgetDirs = files.filter(file => {
        const fullPath = path.join(this.config.dataDir, file);
        return fs.statSync(fullPath).isDirectory();
      });

      budgetDirs.forEach(budgetId => {
        const metadataPath = path.join(this.config.dataDir, budgetId, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          if (metadata.cloudFileId) {
            this.syncIdToBudgetIdMap[metadata.cloudFileId] = budgetId;
          }
        }
      });
    } catch (error) {
      console.warn('Failed to refresh budget cache map', error.message);
    }
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
