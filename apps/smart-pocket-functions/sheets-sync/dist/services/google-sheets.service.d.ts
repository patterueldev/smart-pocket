/**
 * Google Sheets Service Wrapper
 *
 * Wraps the existing JS service and provides typed interface
 * SOLID: Dependency Inversion - implements IGoogleSheetsService
 * SOLID: Single Responsibility - delegates to existing service
 */
import { IGoogleSheetsService, SyncDraft, SyncResult, IDraftStore } from '../types/index';
interface ActualBudgetConfig {
    baseUrl: string;
    password?: string;
}
export declare class GoogleSheetsService implements IGoogleSheetsService {
    private draftStore;
    private actualBudgetConfig;
    constructor(draftStore: IDraftStore, actualBudgetConfig: ActualBudgetConfig);
    getSyncDraft(): Promise<SyncDraft | null>;
    approveSyncDraft(draftId: string): Promise<SyncResult>;
}
export {};
//# sourceMappingURL=google-sheets.service.d.ts.map