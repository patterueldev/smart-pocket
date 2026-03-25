"use strict";
/**
 * Google Sheets Service Wrapper
 *
 * Wraps the existing JS service and provides typed interface
 * SOLID: Dependency Inversion - implements IGoogleSheetsService
 * SOLID: Single Responsibility - delegates to existing service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = void 0;
const logger_1 = require("../utils/logger");
// Import the existing JS service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const googleSheetsModule = require('../../../../../google-sheets.service');
class GoogleSheetsService {
    constructor(draftStore, actualBudgetConfig) {
        this.draftStore = draftStore;
        this.actualBudgetConfig = actualBudgetConfig;
        logger_1.logger.debug('GoogleSheetsService initialized');
    }
    async getSyncDraft() {
        try {
            logger_1.logger.info('Getting sync draft...');
            const draft = await googleSheetsModule.getPendingSyncs(this.actualBudgetConfig);
            if (!draft) {
                logger_1.logger.info('No pending syncs found');
                return null;
            }
            // Store draft for later approval
            this.draftStore.set(draft.id, draft);
            logger_1.logger.info('Sync draft created', {
                draftId: draft.id,
                pendingCount: draft.pendingChanges.length,
            });
            return draft;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('Failed to get sync draft', { error: errorMessage });
            throw error;
        }
    }
    async approveSyncDraft(draftId) {
        try {
            logger_1.logger.info('Approving sync draft', { draftId });
            const draft = this.draftStore.get(draftId);
            if (!draft) {
                const error = new Error('Draft not found or expired');
                error.code = 'DRAFT_NOT_FOUND';
                throw error;
            }
            // Execute the sync
            const result = await googleSheetsModule.executeSync(draftId);
            logger_1.logger.info('Sync draft approved and executed', {
                draftId,
                accountsSynced: draft.allAccounts.length,
                rowsWritten: result.rowsUpdated,
            });
            return {
                success: result.success,
                draftId: result.draftId,
                syncedAt: result.syncedAt,
                accountsSynced: result.accountsSynced,
                rowsWritten: result.rowsWritten,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const code = error?.code;
            logger_1.logger.error('Failed to approve sync draft', {
                draftId,
                error: errorMessage,
                code,
            });
            throw error;
        }
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
//# sourceMappingURL=google-sheets.service.js.map