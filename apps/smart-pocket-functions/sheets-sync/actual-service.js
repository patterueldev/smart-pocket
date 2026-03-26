const { ActualBudget } = require('./lib');
const { ActualBudgetRepository } = require('./repository');

// Initialize service
const actualBudget = new ActualBudget({
  dataDir: process.env.ACTUAL_BUDGET_DATA_DIR || '/tmp/actual-cache',
  serverURL: process.env.ACTUAL_BUDGET_SERVER_URL || 'http://localhost:5006',
  password: process.env.ACTUAL_BUDGET_PASSWORD,
  budgetId: process.env.ACTUAL_BUDGET_ID,
  currency: process.env.ACTUAL_BUDGET_CURRENCY || 'USD'
});

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