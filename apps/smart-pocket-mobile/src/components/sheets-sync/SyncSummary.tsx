import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SyncSummaryProps {
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
}

export function SyncSummary({ totalAccounts, newAccounts, updatedAccounts }: SyncSummaryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.item}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Total</Text>
        <Text style={[styles.value, isDark && styles.valueDark]}>{totalAccounts}</Text>
      </View>

      {newAccounts > 0 && (
        <View style={styles.item}>
          <Text style={[styles.label, isDark && styles.labelDark]}>New</Text>
          <Text style={[styles.valueNew, isDark && styles.valueNewDark]}>{newAccounts}</Text>
        </View>
      )}

      {updatedAccounts > 0 && (
        <View style={styles.item}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Updated</Text>
          <Text style={[styles.valueUpdated, isDark && styles.valueUpdatedDark]}>{updatedAccounts}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#333',
  },
  item: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  labelDark: {
    color: '#666',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  valueDark: {
    color: '#fff',
  },
  valueNew: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  valueNewDark: {
    color: '#66BB6A',
  },
  valueUpdated: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  valueUpdatedDark: {
    color: '#42A5F5',
  },
});
