/**
 * SyncChangeItem Component Tests
 */

import { render, screen } from '@testing-library/react';
import { SyncChangeItem } from '@/components/sheets-sync/SyncChangeItem';
import type { AccountChange } from '@/services/sheets-sync/ISheetsSync';

describe('SyncChangeItem', () => {
  const mockChange: AccountChange = {
    accountName: 'Test Account',
    type: 'UPDATE',
    isNew: false,
    currentBalance: 1500.5,
    sheetBalance: 1200.0,
    currency: 'USD',
    cleared: {
      current: { amount: '1000.00', currency: 'USD' },
      synced: { amount: '900.00', currency: 'USD' },
    },
    uncleared: {
      current: { amount: '500.50', currency: 'USD' },
      synced: { amount: '300.00', currency: 'USD' },
    },
    lastSyncTime: null,
  };

  it('should render account name', () => {
    render(<SyncChangeItem change={mockChange} />);

    expect(screen.getByText('Test Account')).toBeInTheDocument();
  });

  it('should render balances', () => {
    render(<SyncChangeItem change={mockChange} />);

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('On Sheet')).toBeInTheDocument();
    // Currency symbol should be displayed
    expect(screen.getByText(/\$1,500\.50/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,200\.00/)).toBeInTheDocument();
  });

  it('should show NEW badge for new accounts', () => {
    const newChange: AccountChange = { ...mockChange, isNew: true, type: 'NEW' };
    render(<SyncChangeItem change={newChange} />);

    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('should not show badge for updated accounts', () => {
    render(<SyncChangeItem change={mockChange} />);

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('should format currency correctly', () => {
    const phpChange: AccountChange = {
      ...mockChange,
      currency: 'PHP',
      currentBalance: 50000,
      sheetBalance: 45000,
    };

    render(<SyncChangeItem change={phpChange} />);

    expect(screen.getByText(/₱50,000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/₱45,000\.00/)).toBeInTheDocument();
  });

  it('should display arrow between balances', () => {
    render(<SyncChangeItem change={mockChange} />);

    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('should display last sync time if available', () => {
    const changeWithSync: AccountChange = {
      ...mockChange,
      lastSyncTime: '2024-01-15T10:30:00Z',
    };

    render(<SyncChangeItem change={changeWithSync} />);

    expect(screen.getByText(/Last synced/)).toBeInTheDocument();
  });
});
