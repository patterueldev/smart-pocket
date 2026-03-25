/**
 * Draft Service
 * 
 * Manages draft operations: creation, retrieval, deletion
 * SOLID: Single Responsibility - handles draft lifecycle
 */

import { SyncDraft, IDraftStore } from '../types/index';
import { logger } from '../utils/logger';

export interface IDraftService {
  getDraft(draftId: string): SyncDraft | null;
  deleteDraft(draftId: string): void;
  clearAllDrafts(): void;
}

export class DraftService implements IDraftService {
  constructor(private draftStore: IDraftStore) {
    logger.debug('DraftService initialized');
  }

  getDraft(draftId: string): SyncDraft | null {
    const draft = this.draftStore.get(draftId);
    if (!draft) {
      logger.warn('Draft not found', { draftId });
    }
    return draft;
  }

  deleteDraft(draftId: string): void {
    this.draftStore.delete(draftId);
    logger.debug('Draft deleted', { draftId });
  }

  clearAllDrafts(): void {
    this.draftStore.clear();
    logger.info('All drafts cleared');
  }
}
