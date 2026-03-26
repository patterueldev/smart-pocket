const { ActualBudget } = require('./lib');
const { ActualBudgetRepository } = require('./repository');
const { ConfigLoader } = require('./config');

// Load configuration (handles secrets and environment variables)
const configLoader = new ConfigLoader();
const config = configLoader.loadConfig();

// Initialize service
const actualBudget = new ActualBudget(config);
const repository = new ActualBudgetRepository(actualBudget);

exports.service = {
  state: "uninitialized",
  
  init() {
    console.log('Sheets Sync Service initialized');
    this.state = "initialized";
  },
  
  // Export classes and instances for use
  ActualBudget,
  ActualBudgetRepository,
  actualBudget,
  repository
};