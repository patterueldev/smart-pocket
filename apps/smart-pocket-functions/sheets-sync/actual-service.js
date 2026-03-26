const { ActualBudget } = require('./lib');
const { ActualBudgetRepository } = require('./repository');

console.log("Environment variables:", {
  ACTUAL_BUDGET_SERVER_URL: process.env.ACTUAL_BUDGET_SERVER_URL,
  ACTUAL_BUDGET_PASSWORD: process.env.ACTUAL_BUDGET_PASSWORD ? '***' : undefined,
  ACTUAL_BUDGET_ID: process.env.ACTUAL_BUDGET_ID,
  ACTUAL_BUDGET_CURRENCY: process.env.ACTUAL_BUDGET_CURRENCY
});

// Initialize service
const actualBudget = new ActualBudget({
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