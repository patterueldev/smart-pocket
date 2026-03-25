"use strict";
/**
 * Sync Service
 *
 * Orchestrates sync operations using injected services
 * SOLID: Single Responsibility - handles sync orchestration
 * SOLID: Dependency Inversion - depends on IGoogleSheetsService
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const logger_1 = require("../utils/logger");
class SyncService {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
        logger_1.logger.debug('SyncService initialized');
    }
    async getDraft() {
        try {
            logger_1.logger.info('Fetching sync draft via SyncService');
            const draft = await this.googleSheetsService.getSyncDraft();
            return draft;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('SyncService: Failed to get draft', { error: errorMessage });
            throw error;
        }
    }
    async approveDraft(draftId) {
        try {
            logger_1.logger.info('Approving sync draft via SyncService', { draftId });
            const result = await this.googleSheetsService.approveSyncDraft(draftId);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('SyncService: Failed to approve draft', {
                draftId,
                error: errorMessage,
            });
            throw error;
        }
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=sync.service.js.map