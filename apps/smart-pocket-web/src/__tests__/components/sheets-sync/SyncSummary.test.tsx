/**
 * SyncSummary Component Tests
 */

import { render, screen } from '@testing-library/react';
import { SyncSummary } from '@/components/sheets-sync/SyncSummary';

describe('SyncSummary', () => {
  it('should render all stats', () => {
    render(<SyncSummary totalAccounts={10} newAccounts={2} updatedAccounts={3} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should hide New count if zero', () => {
    render(<SyncSummary totalAccounts={10} newAccounts={0} updatedAccounts={3} />);

    // New should not be in the document
    expect(screen.queryByText('New')).not.toBeInTheDocument();
    // But Total and Updated should be
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });

  it('should hide Updated count if zero', () => {
    render(<SyncSummary totalAccounts={10} newAccounts={2} updatedAccounts={0} />);

    expect(screen.queryByText('Updated')).not.toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should always show Total count', () => {
    render(<SyncSummary totalAccounts={5} newAccounts={0} updatedAccounts={0} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
