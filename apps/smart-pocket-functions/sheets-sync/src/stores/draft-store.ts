/**
 * In-Memory Draft Store Implementation
 * 
 * SOLID: Single Responsibility - manages draft persistence
 * SOLID: Dependency Inversion - implements IDraftStore interface
 */

import { SyncDraft, IDraftStore } from '../types/index';

export class InMemoryDraftStore implements IDraftStore {
  private store: Map<string, SyncDraft> = new Map();

  set(id: string, draft: SyncDraft): void {
    this.store.set(id, draft);
  }

  get(id: string): SyncDraft | null {
    return this.store.get(id) ?? null;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
