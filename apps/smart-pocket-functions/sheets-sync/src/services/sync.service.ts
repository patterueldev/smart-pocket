/**
 * Sync Service
 * 
 * Orchestrates sync operations using injected services
 * SOLID: Single Responsibility - handles sync orchestration
 * SOLID: Dependency Inversion - depends on IGoogleSheetsService
 */

import { IGoogleSheetsService, SyncDraft, SyncResult } from '../types/index';
import { logger } from '../utils/logger';

export class SyncService {
  constructor(private googleSheetsService: IGoogleSheetsService) {
    logger.debug('SyncService initialized');
  }

  async getDraft(): Promise<SyncDraft | null> {
    try {
      logger.info('Fetching sync draft via SyncService');
      const draft = await this.googleSheetsService.getSyncDraft();
      return draft;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('SyncService: Failed to get draft', { error: errorMessage });
      throw error;
    }
  }

  async approveDraft(draftId: string): Promise<SyncResult> {
    try {
      logger.info('Approving sync draft via SyncService', { draftId });
      const result = await this.googleSheetsService.approveSyncDraft(draftId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('SyncService: Failed to approve draft', {
        draftId,
        error: errorMessage,
      });
      throw error;
    }
  }
}
