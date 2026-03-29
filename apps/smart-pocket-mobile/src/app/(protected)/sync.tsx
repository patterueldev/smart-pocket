/**
 * Google Sheets Sync Screen
 *
 * Displays pending account balance syncs with:
 * - Pull to refresh
 * - List of accounts with changes (cleared/uncleared)
 * - Sync button
 * - Empty state when all synced
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MockSheetsSyncClient } from '@/services/sheets-sync';
import type { SheetsSyncDraft, AccountChange } from '@/services/sheets-sync/ISheetsSync';

export default function SyncScreen() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [draft, setDraft] = useState<SheetsSyncDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize the client instance
  const sheetsSyncClientRef = useRef(new MockSheetsSyncClient());
  const sheetsSyncClient = sheetsSyncClientRef.current;

  // Load draft on mount
  useEffect(() => {
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newDraft = await sheetsSyncClient.createDraft();
      setDraft(newDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load draft');
    } finally {
      setLoading(false);
    }
  }, [sheetsSyncClient]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDraft();
    setRefreshing(false);
  }, [loadDraft]);

  const onSync = useCallback(async () => {
    if (!draft) return;
    try {
      setSyncing(true);
      setError(null);
      await sheetsSyncClient.executeSync(draft.draftId);
      await loadDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [draft, sheetsSyncClient, loadDraft]);

  // Currency symbols map
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    PHP: '₱',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    SEK: 'kr',
    NZD: 'NZ$',
  };

  const getCurrencySymbol = (code: string): string => {
    return CURRENCY_SYMBOLS[code] || code;
  };

  const formatDate = (isoDate?: string | null): string => {
    if (!isoDate) return 'Not synced yet';

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Not synced yet';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string): string => {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const symbol = getCurrencySymbol(currency);
    const formatted = absoluteAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  };

  const hasPendingChanges = draft && draft.changes && draft.changes.length > 0;

  // Skeleton loader for initial loading
  const skeletonLayout = [
    { key: 'skeleton1', width: '100%', height: 120, marginBottom: 16, borderRadius: 8 },
    { key: 'skeleton2', width: '100%', height: 120, marginBottom: 16, borderRadius: 8 },
    { key: 'skeleton3', width: '100%', height: 120, marginBottom: 16, borderRadius: 8 },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContent}>
          {skeletonLayout.map((item) => (
            <View
              key={item.key}
              style={{
                width: item.width,
                height: item.height,
                marginBottom: item.marginBottom,
                borderRadius: item.borderRadius,
                backgroundColor: '#E0E0E0',
              }}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {!hasPendingChanges && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>All accounts are synced</Text>
              <Text style={styles.emptyText}>Pull down to check for updates</Text>
              {draft?.lastSyncTime && (
                <Text style={styles.lastSyncText}>
                  Last synced: {formatDate(draft.lastSyncTime)}
                </Text>
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasPendingChanges && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {draft.changes.length} account{draft.changes.length !== 1 ? 's' : ''} need sync
                </Text>
                <Text style={styles.summarySubtitle}>
                  {draft.updatedAccounts} updated • {draft.newAccounts} new
                </Text>
              </View>

              {draft.changes.map((change: AccountChange, index: number) => (
                <View key={change.accountId || `${change.accountName}-${index}`} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <Text style={styles.accountIcon}>
                      {change.accountName.includes('Cash') ? '💵' : '💳'}
                    </Text>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{change.accountName}</Text>
                      <Text style={styles.lastSynced}>
                        Last synced: {formatDate(change.lastSyncTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Current:</Text>
                    <Text style={styles.balanceValue}>
                      {formatAmount(change.currentBalance, change.currency)}
                    </Text>
                  </View>

                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>On Sheet:</Text>
                    <Text style={styles.balanceValue}>
                      {formatAmount(change.sheetBalance, change.currency)}
                    </Text>
                  </View>

                  <View style={styles.balanceChange}>
                    <Text style={styles.balanceOld}>
                      {formatAmount(change.sheetBalance, change.currency)}
                    </Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.balanceNew}>
                      {formatAmount(change.currentBalance, change.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {hasPendingChanges && (
        <View style={[styles.actions, styles.actionsPadding]}>
          <TouchableOpacity
            style={[styles.button, syncing && styles.buttonDisabled]}
            onPress={onSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sync to Google Sheets</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.select({ ios: 32, android: 20 }),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: '#c62828',
    fontWeight: '600',
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  accountCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  lastSynced: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  balanceOld: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  balanceNew: {
    fontSize: 14,
    color: '#388E3C',
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    paddingBottom: Platform.select({ ios: 48, android: 24 }),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  actionsPadding: {
    paddingBottom: 0,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
