/**
 * Sync Page
 * Main page for synchronizing Actual Budget accounts with Google Sheets
 *
 * Displays pending account balance changes and allows users to approve and sync.
 *
 * Features:
 * - Pull-to-refresh to check for new changes
 * - List of accounts with balance differences
 * - One-click sync to Google Sheets
 * - Empty state when all synced
 * - Error handling and retry logic
 */

import { useMemo } from 'react';
import { useSheetsSync } from '@/hooks/useSheetsSync';
import { MockSheetsSyncClient } from '@/services/sheets-sync/MockSheetsSyncClient';
import { MainLayout } from '@/components/MainLayout';
import {
  SyncEmptyState,
  SyncSummary,
  SyncChangeItem,
  SyncErrorState,
  SyncActionButton,
} from '@/components/sheets-sync';
import './Sync.css';

/**
 * Sync Page Component
 *
 * Note: This page currently uses MockSheetsSyncClient for development.
 * In a future phase, the sheets-sync service will be provided through
 * the AuthContext via ServiceFactory extension.
 */
export function Sync() {
  // Initialize mock sheets sync client
  // In production, this will come from AuthContext/ServiceFactory
  const sheetsSync = useMemo(() => {
    return new MockSheetsSyncClient();
  }, []);

  const { draft, loading, syncing, error, onRefresh, onSync } =
    useSheetsSync(sheetsSync);

  // Check if there are pending changes to sync
  const hasPendingChanges = draft && draft.changes && draft.changes.length > 0;

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <MainLayout title="Google Sheets Sync" subtitle="Review and sync your accounts">
        <div className="sync-skeleton-container">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sync-skeleton-item" />
          ))}
        </div>
      </MainLayout>
    );
  }

  // Error state - show error message with retry button (no pending changes)
  if (error && !hasPendingChanges) {
    return (
      <MainLayout title="Google Sheets Sync" subtitle="Review and sync your accounts">
        <div className="sync-content-wrapper">
          <SyncErrorState error={error} onRetry={onRefresh} />
        </div>
      </MainLayout>
    );
  }

  // Empty state - all synced
  if (!hasPendingChanges) {
    return (
      <MainLayout title="Google Sheets Sync" subtitle="Review and sync your accounts">
        <div className="sync-content-wrapper">
          <div className="sync-empty-state-wrapper">
            <SyncEmptyState lastSyncTime={draft?.lastSyncTime} />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Main sync screen - display changes and sync button
  return (
    <MainLayout title="Google Sheets Sync" subtitle="Review and sync your accounts">
      <div className="sync-page-content">
        {/* Show error if it occurred during sync operation */}
        {error && (
          <div className="sync-inline-error">
            <SyncErrorState error={error} onRetry={onRefresh} />
          </div>
        )}

        {/* Summary of changes */}
        {draft && (
          <div className="sync-summary-section">
            <SyncSummary
              totalAccounts={draft.totalAccounts}
              newAccounts={draft.newAccounts}
              updatedAccounts={draft.updatedAccounts}
            />
          </div>
        )}

        {/* List of accounts with changes */}
        <div className="sync-changes-list">
          {draft?.changes?.map((change, index) => (
            <SyncChangeItem
              key={change.accountName || `change-${index}`}
              change={change}
            />
          ))}
        </div>

        {/* Action button - sync to Google Sheets */}
        <div className="sync-action-button-wrapper">
          <SyncActionButton onPress={onSync} loading={syncing} disabled={error !== null} />
        </div>
      </div>
    </MainLayout>
  );
}
