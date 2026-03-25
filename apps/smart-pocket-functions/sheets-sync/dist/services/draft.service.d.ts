/**
 * Draft Service
 *
 * Manages draft operations: creation, retrieval, deletion
 * SOLID: Single Responsibility - handles draft lifecycle
 */
import { SyncDraft, IDraftStore } from '../types/index';
export interface IDraftService {
    getDraft(draftId: string): SyncDraft | null;
    deleteDraft(draftId: string): void;
    clearAllDrafts(): void;
}
export declare class DraftService implements IDraftService {
    private draftStore;
    constructor(draftStore: IDraftStore);
    getDraft(draftId: string): SyncDraft | null;
    deleteDraft(draftId: string): void;
    clearAllDrafts(): void;
}
//# sourceMappingURL=draft.service.d.ts.map