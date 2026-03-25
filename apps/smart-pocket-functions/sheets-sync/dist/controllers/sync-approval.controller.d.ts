/**
 * Sync Approval Controller
 *
 * Handles POST /sync route - approves and executes sync
 * SOLID: Single Responsibility - HTTP request handling for sync endpoint
 */
import { SyncService } from '../services/sync.service';
import { HttpResponse } from '../types/index';
interface SyncRequest {
    draftId: string;
}
export declare class SyncApprovalController {
    private syncService;
    constructor(syncService: SyncService);
    approveSyncDraft(request: SyncRequest): Promise<HttpResponse>;
}
export {};
//# sourceMappingURL=sync-approval.controller.d.ts.map