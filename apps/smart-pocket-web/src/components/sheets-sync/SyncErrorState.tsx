import './SyncErrorState.css';

interface SyncErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function SyncErrorState({ error, onRetry }: SyncErrorStateProps) {
  return (
    <div className="sync-error-state">
      <div className="sync-error-icon">⚠️</div>
      <div className="sync-error-title">Something went wrong</div>
      <div className="sync-error-message">{error}</div>

      <button className="sync-error-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
