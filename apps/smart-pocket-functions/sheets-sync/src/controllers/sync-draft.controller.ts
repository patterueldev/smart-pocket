/**
 * Sync Draft Controller
 * 
 * Handles GET /draft route - returns pending sync changes
 * SOLID: Single Responsibility - HTTP request handling for draft endpoint
 */

import { SyncService } from '../services/sync.service';
import { HttpResponse, ApiError } from '../types/index';
import { logger } from '../utils/logger';

export class SyncDraftController {
  constructor(private syncService: SyncService) {
    logger.debug('SyncDraftController initialized');
  }

  async getDraft(): Promise<HttpResponse> {
    try {
      logger.info('GET /draft - fetching sync draft');
      
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.code;
      
      logger.error('GET /draft failed', {
        error: errorMessage,
        code: errorCode,
      });

      const response: ApiError = {
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
