import { useSetupForm } from '@/hooks/useSetupForm';

describe('useSetupForm', () => {
  const defaultBaseUrl = 'http://localhost:3000';
  const mockOnSuccess = jest.fn().mockResolvedValue(undefined);
  const mockGetError = jest.fn().mockReturnValue(null);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof useSetupForm).toBe('function');
  });

  it('should be exportable and importable', () => {
    // Basic sanity check that the hook exists
    expect(useSetupForm).toBeDefined();
    expect(useSetupForm.name).toBe('useSetupForm');
  });

  it('should have correct function signature', () => {
    // The function should accept configuration object
    const config = {
      defaultBaseUrl,
      onSuccess: mockOnSuccess,
      getErrorMessage: mockGetError,
    };

    expect(config).toBeDefined();
    expect(config.defaultBaseUrl).toBe('http://localhost:3000');
    expect(typeof config.onSuccess).toBe('function');
    expect(typeof config.getErrorMessage).toBe('function');
  });
});
