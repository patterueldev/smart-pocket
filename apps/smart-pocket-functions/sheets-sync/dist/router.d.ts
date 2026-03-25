/**
 * HTTP Router
 *
 * Routes HTTP requests to appropriate controllers
 * SOLID: Single Responsibility - request routing
 * SOLID: Open/Closed - easy to add new routes
 */
import { SyncDraftController } from './controllers/sync-draft.controller';
import { SyncApprovalController } from './controllers/sync-approval.controller';
import { HttpResponse } from './types/index';
interface RouteContext {
    path: string;
    method: string;
    body?: string;
}
export declare class Router {
    private draftController;
    private approvalController;
    constructor(draftController: SyncDraftController, approvalController: SyncApprovalController);
    route(context: RouteContext): Promise<HttpResponse>;
}
export {};
//# sourceMappingURL=router.d.ts.map