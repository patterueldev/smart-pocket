/**
 * SyncErrorState Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SyncErrorState } from '@/components/sheets-sync/SyncErrorState';

describe('SyncErrorState', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error message', () => {
    render(<SyncErrorState error="Network connection failed" onRetry={mockOnRetry} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  it('should show warning icon', () => {
    render(<SyncErrorState error="Test error" onRetry={mockOnRetry} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should render retry button', () => {
    render(<SyncErrorState error="Test error" onRetry={mockOnRetry} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should call onRetry when button clicked', async () => {
    const user = userEvent.setup();
    render(<SyncErrorState error="Test error" onRetry={mockOnRetry} />);

    const button = screen.getByText('Try Again');
    await user.click(button);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should handle long error messages', () => {
    const longError = 'A'.repeat(200);
    render(<SyncErrorState error={longError} onRetry={mockOnRetry} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });
});
