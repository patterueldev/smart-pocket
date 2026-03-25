"use strict";
/**
 * In-Memory Draft Store Implementation
 *
 * SOLID: Single Responsibility - manages draft persistence
 * SOLID: Dependency Inversion - implements IDraftStore interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDraftStore = void 0;
class InMemoryDraftStore {
    constructor() {
        this.store = new Map();
    }
    set(id, draft) {
        this.store.set(id, draft);
    }
    get(id) {
        return this.store.get(id) ?? null;
    }
    delete(id) {
        this.store.delete(id);
    }
    clear() {
        this.store.clear();
    }
}
exports.InMemoryDraftStore = InMemoryDraftStore;
//# sourceMappingURL=draft-store.js.map