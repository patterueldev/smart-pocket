/**
 * OpenFaaS Handler (Entry Point)
 * 
 * Configures dependency injection and handles OpenFaaS context
 * SOLID: All principles applied through DI composition
 */

import { Router } from './router';
import { SyncDraftController } from './controllers/sync-draft.controller';
import { SyncApprovalController } from './controllers/sync-approval.controller';
import { GoogleSheetsService } from './services/google-sheets.service';
import { SyncService } from './services/sync.service';
import { InMemoryDraftStore } from './stores/draft-store';
import { logger } from './utils/logger';

/**
 * Initialize application services with dependency injection
 */
function initializeServices() {
  // Infrastructure layer
  const draftStore = new InMemoryDraftStore();

  // External service integration
  const actualBudgetConfig = {
    baseUrl: process.env.ACTUAL_BUDGET_URL || 'http://localhost:5006',
    password: process.env.ACTUAL_BUDGET_PASSWORD,
  };

  const googleSheetsService = new GoogleSheetsService(
    draftStore,
    actualBudgetConfig
  );

  // Orchestration service
  const syncService = new SyncService(googleSheetsService);

  // Controllers
  const draftController = new SyncDraftController(syncService);
  const approvalController = new SyncApprovalController(syncService);

  // Router
  const router = new Router(draftController, approvalController);

  return router;
}

/**
 * OpenFaaS handler
 * 
 * Signature matches OpenFaaS v0.11 or higher function format.
 * The context object provides convenience methods like status(), succeed(), etc.
 */
async function handle(event: any, context: any) {
  try {
    const router = initializeServices();

    const { path, method, body, headers } = event;

    logger.info('Request received', {
      path,
      method,
      contentType: headers?.['content-type'],
    });

    const response = await router.route({
      path,
      method,
      body,
    });

    logger.info('Response sent', {
      statusCode: response.statusCode,
    });

    return context
      .status(response.statusCode)
      .headers(response.headers || { 'Content-Type': 'application/json' })
      .succeed(response.body);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unhandled error in handler', { error: errorMessage });

    return context
      .status(500)
      .headers({ 'Content-Type': 'application/json' })
      .succeed(
        JSON.stringify({
          error: 'Internal server error',
          message: errorMessage,
        })
      );
  }
}

module.exports = handle;
