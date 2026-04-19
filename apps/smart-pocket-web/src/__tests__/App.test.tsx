import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the setup page on initial load', () => {
    render(<App />);
    expect(screen.getByText('Setup Smart Pocket')).toBeInTheDocument();
    expect(screen.getByText('Enter your API credentials to get started')).toBeInTheDocument();
  });

  it('has API Key and API Base URL input fields', () => {
    render(<App />);
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByLabelText('API Base URL')).toBeInTheDocument();
  });

  it('disables submit button when form is empty', () => {
    render(<App />);
    const submitButton = screen.getByRole('button', { name: /Setup/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const apiUrlInput = screen.getByLabelText('API Base URL');
    const submitButton = screen.getByRole('button', { name: /Setup/i });

    await user.type(apiKeyInput, 'test-api-key');
    await user.type(apiUrlInput, 'http://localhost:3000/api');

    expect(submitButton).not.toBeDisabled();
  });
});
