"use strict";
/**
 * HTTP Router
 *
 * Routes HTTP requests to appropriate controllers
 * SOLID: Single Responsibility - request routing
 * SOLID: Open/Closed - easy to add new routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const logger_1 = require("./utils/logger");
class Router {
    constructor(draftController, approvalController) {
        this.draftController = draftController;
        this.approvalController = approvalController;
        logger_1.logger.debug('Router initialized');
    }
    async route(context) {
        const { path, method, body } = context;
        const normalizedPath = path.replace(/\/$/, '') || '/';
        logger_1.logger.info('Routing request', { path: normalizedPath, method });
        // Route: GET /draft
        if (normalizedPath === '/draft' && method === 'GET') {
            return this.draftController.getDraft();
        }
        // Route: POST /sync
        if (normalizedPath === '/sync' && method === 'POST') {
            try {
                const request = body ? JSON.parse(body) : {};
                return this.approvalController.approveSyncDraft(request);
            }
            catch (error) {
                logger_1.logger.error('Failed to parse request body', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const response = {
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
        logger_1.logger.warn('Route not found', { path: normalizedPath, method });
        const response = {
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
exports.Router = Router;
//# sourceMappingURL=router.js.map