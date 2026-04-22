import type { AccountChange } from '@/services/sheets-sync/ISheetsSync';
import './SyncChangeItem.css';

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
    <div className="sync-change-item">
      <div className="sync-change-header">
        <div className="sync-change-account-name">{change.accountName}</div>
        {change.isNew && <span className="sync-change-badge">NEW</span>}
      </div>

      <div className="sync-change-balances">
        <div className="sync-change-column">
          <div className="sync-change-label">Current</div>
          <div className="sync-change-balance">
            {formatAmount(change.currentBalance, change.currency)}
          </div>
        </div>

        <div className="sync-change-arrow">→</div>

        <div className="sync-change-column">
          <div className="sync-change-label">On Sheet</div>
          <div className="sync-change-balance-sheet">
            {formatAmount(change.sheetBalance, change.currency)}
          </div>
        </div>
      </div>

      {change.lastSyncTime && (
        <div className="sync-change-sync-time">
          Last synced: {new Date(change.lastSyncTime).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
