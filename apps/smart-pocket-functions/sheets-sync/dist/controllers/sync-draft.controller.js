"use strict";
/**
 * Sync Draft Controller
 *
 * Handles GET /draft route - returns pending sync changes
 * SOLID: Single Responsibility - HTTP request handling for draft endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncDraftController = void 0;
const logger_1 = require("../utils/logger");
class SyncDraftController {
    constructor(syncService) {
        this.syncService = syncService;
        logger_1.logger.debug('SyncDraftController initialized');
    }
    async getDraft() {
        try {
            logger_1.logger.info('GET /draft - fetching sync draft');
            const draft = await this.syncService.getDraft();
            if (!draft) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'No pending sync changes',
                        draft: null,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                };
            }
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Sync draft retrieved successfully',
                    draft,
                }),
                headers: { 'Content-Type': 'application/json' },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorCode = error?.code;
            logger_1.logger.error('GET /draft failed', {
                error: errorMessage,
                code: errorCode,
            });
            const response = {
                error: 'Failed to retrieve sync draft',
                message: errorMessage,
                code: errorCode,
            };
            return {
                statusCode: 500,
                body: JSON.stringify(response),
                headers: { 'Content-Type': 'application/json' },
            };
        }
    }
}
exports.SyncDraftController = SyncDraftController;
//# sourceMappingURL=sync-draft.controller.js.map