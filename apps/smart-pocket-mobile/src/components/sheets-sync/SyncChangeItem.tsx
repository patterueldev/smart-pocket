import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AccountChange } from '@/services/sheets-sync/ISheetsSync';

interface SyncChangeItemProps {
  change: AccountChange;
}

export function SyncChangeItem({ change }: SyncChangeItemProps) {
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

  const getCurrencySymbol = (code: string): string => CURRENCY_SYMBOLS[code] || code;

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.accountName}>
          {change.accountName}
        </Text>
        {change.isNew && <Text style={styles.badge}>NEW</Text>}
      </View>

      <View style={styles.balances}>
        <View style={styles.balanceColumn}>
          <Text style={styles.label}>Current</Text>
          <Text style={styles.balance}>
            {formatAmount(change.currentBalance, change.currency)}
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>

        <View style={styles.balanceColumn}>
          <Text style={styles.label}>On Sheet</Text>
          <Text style={styles.balanceSheet}>
            {formatAmount(change.sheetBalance, change.currency)}
          </Text>
        </View>
      </View>

      {change.lastSyncTime && (
        <Text style={styles.syncTime}>
          Last synced: {new Date(change.lastSyncTime).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  balances: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  balanceColumn: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  balance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  balanceSheet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C',
  },
  arrow: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  syncTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
