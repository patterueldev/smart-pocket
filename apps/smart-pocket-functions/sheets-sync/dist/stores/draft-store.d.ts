/**
 * In-Memory Draft Store Implementation
 *
 * SOLID: Single Responsibility - manages draft persistence
 * SOLID: Dependency Inversion - implements IDraftStore interface
 */
import { SyncDraft, IDraftStore } from '../types/index';
export declare class InMemoryDraftStore implements IDraftStore {
    private store;
    set(id: string, draft: SyncDraft): void;
    get(id: string): SyncDraft | null;
    delete(id: string): void;
    clear(): void;
}
//# sourceMappingURL=draft-store.d.ts.map