"use strict";
/**
 * OpenFaaS Handler (Entry Point)
 *
 * Configures dependency injection and handles OpenFaaS context
 * SOLID: All principles applied through DI composition
 */
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const sync_draft_controller_1 = require("./controllers/sync-draft.controller");
const sync_approval_controller_1 = require("./controllers/sync-approval.controller");
const google_sheets_service_1 = require("./services/google-sheets.service");
const sync_service_1 = require("./services/sync.service");
const draft_store_1 = require("./stores/draft-store");
const logger_1 = require("./utils/logger");
/**
 * Initialize application services with dependency injection
 */
function initializeServices() {
    // Infrastructure layer
    const draftStore = new draft_store_1.InMemoryDraftStore();
    // External service integration
    const actualBudgetConfig = {
        baseUrl: process.env.ACTUAL_BUDGET_URL || 'http://localhost:5006',
        password: process.env.ACTUAL_BUDGET_PASSWORD,
    };
    const googleSheetsService = new google_sheets_service_1.GoogleSheetsService(draftStore, actualBudgetConfig);
    // Orchestration service
    const syncService = new sync_service_1.SyncService(googleSheetsService);
    // Controllers
    const draftController = new sync_draft_controller_1.SyncDraftController(syncService);
    const approvalController = new sync_approval_controller_1.SyncApprovalController(syncService);
    // Router
    const router = new router_1.Router(draftController, approvalController);
    return router;
}
/**
 * OpenFaaS handler
 *
 * Signature matches OpenFaaS v0.11 or higher function format.
 * The context object provides convenience methods like status(), succeed(), etc.
 */
async function handle(event, context) {
    try {
        const router = initializeServices();
        const { path, method, body, headers } = event;
        logger_1.logger.info('Request received', {
            path,
            method,
            contentType: headers?.['content-type'],
        });
        const response = await router.route({
            path,
            method,
            body,
        });
        logger_1.logger.info('Response sent', {
            statusCode: response.statusCode,
        });
        return context
            .status(response.statusCode)
            .headers(response.headers || { 'Content-Type': 'application/json' })
            .succeed(response.body);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error('Unhandled error in handler', { error: errorMessage });
        return context
            .status(500)
            .headers({ 'Content-Type': 'application/json' })
            .succeed(JSON.stringify({
            error: 'Internal server error',
            message: errorMessage,
        }));
    }
}
module.exports = handle;
//# sourceMappingURL=handler.js.map