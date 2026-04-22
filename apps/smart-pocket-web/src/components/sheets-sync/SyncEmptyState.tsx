import './SyncEmptyState.css';

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
    <div className="sync-empty-state">
      <div className="sync-empty-checkmark">✓</div>
      <div className="sync-empty-title">Everything is synced</div>
      <div className="sync-empty-date">Last sync: {formatDate(lastSyncTime)}</div>
    </div>
  );
}
