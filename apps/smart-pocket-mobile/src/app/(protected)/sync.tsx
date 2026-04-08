/**
 * Sheets Sync Screen
 *
 * Main screen for synchronizing Actual Budget accounts with Google Sheets.
 * Displays pending account balance changes and allows users to approve and sync.
 *
 * Features:
 * - Pull-to-refresh to check for new changes
 * - List of accounts with balance differences
 * - One-click sync to Google Sheets
 * - Empty state when all synced
 * - Error handling and retry logic
 */

import React, { useContext } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '@/utils/authContext';
import { useSheetsSync } from '@/hooks/useSheetsSync';
import {
  SyncEmptyState,
  SyncSummary,
  SyncChangeItem,
  SyncErrorState,
  SyncActionButton,
} from '@/components/sheets-sync';

export default function SyncScreen() {
  const authContext = useContext(AuthContext);
  const { draft, loading, syncing, refreshing, error, onRefresh, onSync } = useSheetsSync(
    authContext.services!.sheetsSync
  );

  // Check if there are pending changes to sync
  const hasPendingChanges = draft && draft.changes && draft.changes.length > 0;

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={styles.skeletonItem}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Error state - show error message with retry button
  if (error && !hasPendingChanges) {
    return (
      <SafeAreaView style={styles.container}>
        <SyncErrorState error={error} onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  // Empty state - all synced
  if (!hasPendingChanges) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <SyncEmptyState lastSyncTime={draft?.lastSyncTime} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main sync screen - display changes and sync button
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Show error if it occurred during sync operation */}
          {error && (
            <View style={styles.inlineError}>
              <SyncErrorState error={error} onRetry={onRefresh} />
            </View>
          )}

          {/* Summary of changes */}
          {draft && (
            <SyncSummary
              totalAccounts={draft.totalAccounts}
              newAccounts={draft.newAccounts}
              updatedAccounts={draft.updatedAccounts}
            />
          )}

          {/* List of accounts with changes */}
          {draft?.changes?.map((change, index) => (
            <SyncChangeItem
              key={change.accountId || `${change.accountName}-${index}`}
              change={change}
            />
          ))}
        </ScrollView>
      </View>

      {/* Action button - sync to Google Sheets */}
      <SyncActionButton onPress={onSync} loading={syncing} disabled={error !== null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: '#fff',
  },
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonItem: {
    height: 120,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  inlineError: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
