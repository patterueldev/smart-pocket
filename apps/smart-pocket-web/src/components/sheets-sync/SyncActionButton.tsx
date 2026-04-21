import './SyncActionButton.css';

interface SyncActionButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function SyncActionButton({ onPress, loading, disabled = false }: SyncActionButtonProps) {
  return (
    <button
      className={`sync-action-button ${(loading || disabled) ? 'sync-action-button-disabled' : ''}`}
      onClick={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <span className="sync-action-loading">
          <span className="sync-action-spinner"></span>
          Syncing...
        </span>
      ) : (
        'Sync Now'
      )}
    </button>
  );
}
