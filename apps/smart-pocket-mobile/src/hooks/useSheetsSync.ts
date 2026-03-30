/**
 * useSheetsSync: Custom hook for managing sheets sync state and operations.
 *
 * Handles:
 * - Loading draft on mount
 * - Refreshing draft (with debouncing)
 * - Executing sync operation
 * - Managing loading/syncing/refreshing states
 * - Error handling and recovery
 *
 * Usage:
 *   const { draft, loading, syncing, refreshing, error, onRefresh, onSync } = useSheetsSync();
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ServiceFactory } from '@/services/ServiceFactory';
import type { SheetsSyncDraft } from '@/services/sheets-sync/ISheetsSync';

const REFRESH_DEBOUNCE_MS = 500;
const USE_MOCK_SERVICES = true; // Switch to false when backend is ready

interface UseSheetsSync {
  draft: SheetsSyncDraft | null;
  loading: boolean;
  syncing: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onSync: () => Promise<void>;
}

export function useSheetsSync(): UseSheetsSync {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [draft, setDraft] = useState<SheetsSyncDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get sheets sync service from factory
  const sheetsSyncService = useRef(
    ServiceFactory.createServices(USE_MOCK_SERVICES ? 'mock' : 'real').sheetsSync
  ).current;

  // Track last refresh time to debounce
  const lastRefreshRef = useRef<number>(0);

  /**
   * Load or reload the draft from the service
   */
  const loadDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newDraft = await sheetsSyncService.createDraft();
      setDraft(newDraft);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load draft';
      setError(errorMessage);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, [sheetsSyncService]);

  /**
   * Refresh draft with debouncing to prevent spam
   */
  const onRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;

    if (timeSinceLastRefresh < REFRESH_DEBOUNCE_MS) {
      // Skip refresh if called too soon
      return;
    }

    lastRefreshRef.current = now;
    setRefreshing(true);
    try {
      await loadDraft();
    } finally {
      setRefreshing(false);
    }
  }, [loadDraft]);

  /**
   * Execute the sync operation with the current draft
   */
  const onSync = useCallback(async () => {
    if (!draft) {
      setError('No draft available to sync');
      return;
    }

    try {
      setSyncing(true);
      setError(null);
      await sheetsSyncService.executeSyncFromDraft(draft.draftId);
      // Reload draft after successful sync
      await loadDraft();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
    } finally {
      setSyncing(false);
    }
  }, [draft, sheetsSyncService, loadDraft]);

  /**
   * Load draft on component mount
   */
  useEffect(() => {
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    draft,
    loading,
    syncing,
    refreshing,
    error,
    onRefresh,
    onSync,
  };
}
