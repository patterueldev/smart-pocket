/**
 * Google Sheets Service Wrapper
 * 
 * Wraps the existing JS service and provides typed interface
 * SOLID: Dependency Inversion - implements IGoogleSheetsService
 * SOLID: Single Responsibility - delegates to existing service
 */

import {
  IGoogleSheetsService,
  SyncDraft,
  SyncResult,
  IDraftStore,
} from '../types/index';
import { logger } from '../utils/logger';

// Import the existing JS service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const googleSheetsModule = require('../../../../../google-sheets.service');

interface ActualBudgetConfig {
  baseUrl: string;
  password?: string;
}

export class GoogleSheetsService implements IGoogleSheetsService {
  constructor(
    private draftStore: IDraftStore,
    private actualBudgetConfig: ActualBudgetConfig
  ) {
    logger.debug('GoogleSheetsService initialized');
  }

  async getSyncDraft(): Promise<SyncDraft | null> {
    try {
      logger.info('Getting sync draft...');
      
      const draft = await googleSheetsModule.getPendingSyncs(
        this.actualBudgetConfig
      );

      if (!draft) {
        logger.info('No pending syncs found');
        return null;
      }

      // Store draft for later approval
      this.draftStore.set(draft.id, draft);
      
      logger.info('Sync draft created', {
        draftId: draft.id,
        pendingCount: draft.pendingChanges.length,
      });

      return draft;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get sync draft', { error: errorMessage });
      throw error;
    }
  }

  async approveSyncDraft(draftId: string): Promise<SyncResult> {
    try {
      logger.info('Approving sync draft', { draftId });

      const draft = this.draftStore.get(draftId);
      if (!draft) {
        const error = new Error('Draft not found or expired');
        (error as any).code = 'DRAFT_NOT_FOUND';
        throw error;
      }

      // Execute the sync
      const result = await googleSheetsModule.executeSync(draftId);

      logger.info('Sync draft approved and executed', {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const code = (error as any)?.code;
      
      logger.error('Failed to approve sync draft', {
        draftId,
        error: errorMessage,
        code,
      });
      
      throw error;
    }
  }
}
