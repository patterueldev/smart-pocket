/**
 * Sync Service
 *
 * Orchestrates sync operations using injected services
 * SOLID: Single Responsibility - handles sync orchestration
 * SOLID: Dependency Inversion - depends on IGoogleSheetsService
 */
import { IGoogleSheetsService, SyncDraft, SyncResult } from '../types/index';
export declare class SyncService {
    private googleSheetsService;
    constructor(googleSheetsService: IGoogleSheetsService);
    getDraft(): Promise<SyncDraft | null>;
    approveDraft(draftId: string): Promise<SyncResult>;
}
//# sourceMappingURL=sync.service.d.ts.map