/**
 * Sync Draft Controller
 *
 * Handles GET /draft route - returns pending sync changes
 * SOLID: Single Responsibility - HTTP request handling for draft endpoint
 */
import { SyncService } from '../services/sync.service';
import { HttpResponse } from '../types/index';
export declare class SyncDraftController {
    private syncService;
    constructor(syncService: SyncService);
    getDraft(): Promise<HttpResponse>;
}
//# sourceMappingURL=sync-draft.controller.d.ts.map