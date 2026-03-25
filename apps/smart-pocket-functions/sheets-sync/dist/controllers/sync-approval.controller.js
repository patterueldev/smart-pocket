"use strict";
/**
 * Sync Approval Controller
 *
 * Handles POST /sync route - approves and executes sync
 * SOLID: Single Responsibility - HTTP request handling for sync endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncApprovalController = void 0;
const logger_1 = require("../utils/logger");
class SyncApprovalController {
    constructor(syncService) {
        this.syncService = syncService;
        logger_1.logger.debug('SyncApprovalController initialized');
    }
    async approveSyncDraft(request) {
        try {
            logger_1.logger.info('POST /sync - approving draft', { draftId: request.draftId });
            // Validate required field
            if (!request.draftId || typeof request.draftId !== 'string') {
                logger_1.logger.warn('POST /sync - invalid draftId', { draftId: request.draftId });
                const response = {
                    error: 'Invalid request',
                    message: 'draftId is required and must be a string',
                    code: 'INVALID_REQUEST',
                };
                return {
                    statusCode: 400,
                    body: JSON.stringify(response),
                    headers: { 'Content-Type': 'application/json' },
                };
            }
            const result = await this.syncService.approveDraft(request.draftId);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Sync completed successfully',
                    result,
                }),
                headers: { 'Content-Type': 'application/json' },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorCode = error?.code;
            logger_1.logger.error('POST /sync failed', {
                error: errorMessage,
                code: errorCode,
            });
            // Handle specific error codes
            if (errorCode === 'DRAFT_NOT_FOUND') {
                const response = {
                    error: 'Draft not found',
                    message: errorMessage,
                    code: errorCode,
                };
                return {
                    statusCode: 404,
                    body: JSON.stringify(response),
                    headers: { 'Content-Type': 'application/json' },
                };
            }
            const response = {
                error: 'Sync execution failed',
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
exports.SyncApprovalController = SyncApprovalController;
//# sourceMappingURL=sync-approval.controller.js.map