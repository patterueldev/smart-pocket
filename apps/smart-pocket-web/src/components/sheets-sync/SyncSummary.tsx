import './SyncSummary.css';

interface SyncSummaryProps {
  totalAccounts: number;
  newAccounts: number;
  updatedAccounts: number;
}

export function SyncSummary({ totalAccounts, newAccounts, updatedAccounts }: SyncSummaryProps) {
  return (
    <div className="sync-summary">
      <div className="sync-summary-item">
        <div className="sync-summary-label">Total</div>
        <div className="sync-summary-value">{totalAccounts}</div>
      </div>

      {newAccounts > 0 && (
        <div className="sync-summary-item">
          <div className="sync-summary-label">New</div>
          <div className="sync-summary-value sync-summary-value-new">{newAccounts}</div>
        </div>
      )}

      {updatedAccounts > 0 && (
        <div className="sync-summary-item">
          <div className="sync-summary-label">Updated</div>
          <div className="sync-summary-value sync-summary-value-updated">{updatedAccounts}</div>
        </div>
      )}
    </div>
  );
}
