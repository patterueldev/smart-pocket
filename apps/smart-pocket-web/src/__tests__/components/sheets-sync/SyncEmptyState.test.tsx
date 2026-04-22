/**
 * SyncEmptyState Component Tests
 */

import { render, screen } from '@testing-library/react';
import { SyncEmptyState } from '@/components/sheets-sync/SyncEmptyState';

describe('SyncEmptyState', () => {
  it('should render empty state message', () => {
    render(<SyncEmptyState />);

    expect(screen.getByText('Everything is synced')).toBeInTheDocument();
    expect(screen.getByText(/Last sync/)).toBeInTheDocument();
  });

  it('should show checkmark', () => {
    render(<SyncEmptyState />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display "Not synced yet" when no last sync time', () => {
    render(<SyncEmptyState lastSyncTime={null} />);

    expect(screen.getByText(/Last sync.*Not synced yet/)).toBeInTheDocument();
  });

  it('should display last sync date when provided', () => {
    const lastSync = '2024-01-15T10:30:00Z';
    render(<SyncEmptyState lastSyncTime={lastSync} />);

    expect(screen.getByText(/Last sync/)).toBeInTheDocument();
    // Date should be formatted
    expect(screen.getByText(/Jan|01/)).toBeInTheDocument();
  });

  it('should handle undefined last sync time', () => {
    render(<SyncEmptyState lastSyncTime={undefined} />);

    expect(screen.getByText(/Not synced yet/)).toBeInTheDocument();
  });
});
