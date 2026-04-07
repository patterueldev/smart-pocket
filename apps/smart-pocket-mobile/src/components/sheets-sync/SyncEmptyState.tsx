import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SyncEmptyStateProps {
  lastSyncTime?: string | null;
}

export function SyncEmptyState({ lastSyncTime }: SyncEmptyStateProps) {
  const formatDate = (isoDate?: string | null): string => {
    if (!isoDate) return 'Not synced yet';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Not synced yet';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.title}>Everything is synced</Text>
      <Text style={styles.date}>Last sync: {formatDate(lastSyncTime)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  checkmark: {
    fontSize: 64,
    marginBottom: 16,
    color: '#388E3C',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});
