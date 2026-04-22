/**
 * SyncActionButton Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SyncActionButton } from '@/components/sheets-sync/SyncActionButton';

describe('SyncActionButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sync button', () => {
    render(<SyncActionButton onPress={mockOnPress} loading={false} />);

    expect(screen.getByText('Sync Now')).toBeInTheDocument();
  });

  it('should call onPress when clicked', async () => {
    const user = userEvent.setup();
    render(<SyncActionButton onPress={mockOnPress} loading={false} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<SyncActionButton onPress={mockOnPress} loading={true} />);

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
    expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
  });

  it('should disable button when loading', async () => {
    const user = userEvent.setup();
    render(<SyncActionButton onPress={mockOnPress} loading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should disable button when disabled prop is true', async () => {
    const user = userEvent.setup();
    render(<SyncActionButton onPress={mockOnPress} loading={false} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show spinner when loading', () => {
    const { container } = render(<SyncActionButton onPress={mockOnPress} loading={true} />);

    const spinner = container.querySelector('.sync-action-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
