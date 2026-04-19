import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('Smart Pocket Web')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<App />);
    expect(
      screen.getByText('Welcome to the web application for Smart Pocket')
    ).toBeInTheDocument();
  });

  it('has a working counter button', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button', { name: /Counter: 0/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('button', { name: /Counter: 1/i })).toBeInTheDocument();
  });
});
