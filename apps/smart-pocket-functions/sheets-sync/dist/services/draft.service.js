"use strict";
/**
 * Draft Service
 *
 * Manages draft operations: creation, retrieval, deletion
 * SOLID: Single Responsibility - handles draft lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftService = void 0;
const logger_1 = require("../utils/logger");
class DraftService {
    constructor(draftStore) {
        this.draftStore = draftStore;
        logger_1.logger.debug('DraftService initialized');
    }
    getDraft(draftId) {
        const draft = this.draftStore.get(draftId);
        if (!draft) {
            logger_1.logger.warn('Draft not found', { draftId });
        }
        return draft;
    }
    deleteDraft(draftId) {
        this.draftStore.delete(draftId);
        logger_1.logger.debug('Draft deleted', { draftId });
    }
    clearAllDrafts() {
        this.draftStore.clear();
        logger_1.logger.info('All drafts cleared');
    }
}
exports.DraftService = DraftService;
//# sourceMappingURL=draft.service.js.map