/**
 * HTTP Router
 * 
 * Routes HTTP requests to appropriate controllers
 * SOLID: Single Responsibility - request routing
 * SOLID: Open/Closed - easy to add new routes
 */

import { SyncDraftController } from './controllers/sync-draft.controller';
import { SyncApprovalController } from './controllers/sync-approval.controller';
import { HttpResponse, ApiError } from './types/index';
import { logger } from './utils/logger';

interface RouteContext {
  path: string;
  method: string;
  body?: string;
}

export class Router {
  constructor(
    private draftController: SyncDraftController,
    private approvalController: SyncApprovalController
  ) {
    logger.debug('Router initialized');
  }

  async route(context: RouteContext): Promise<HttpResponse> {
    const { path, method, body } = context;
    const normalizedPath = path.replace(/\/$/, '') || '/';

    logger.info('Routing request', { path: normalizedPath, method });

    // Route: GET /draft
    if (normalizedPath === '/draft' && method === 'GET') {
      return this.draftController.getDraft();
    }

    // Route: POST /sync
    if (normalizedPath === '/sync' && method === 'POST') {
      try {
        const request = body ? JSON.parse(body) : {};
        return this.approvalController.approveSyncDraft(request);
      } catch (error) {
        logger.error('Failed to parse request body', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        const response: ApiError = {
          error: 'Invalid JSON in request body',
          message: error instanceof Error ? error.message : 'Failed to parse body',
          code: 'INVALID_JSON',
        };

        return {
          statusCode: 400,
          body: JSON.stringify(response),
          headers: { 'Content-Type': 'application/json' },
        };
      }
    }

    // 404 - Route not found
    logger.warn('Route not found', { path: normalizedPath, method });

    const response: ApiError = {
      error: 'Not found',
      message: `Route ${method} ${normalizedPath} not found`,
      code: 'NOT_FOUND',
    };

    return {
      statusCode: 404,
      body: JSON.stringify(response),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
