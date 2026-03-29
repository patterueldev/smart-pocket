import { renderHook, act } from '@testing-library/react';
import { useSetupForm } from '../../hooks/useSetupForm';

describe('useSetupForm', () => {
  const mockOnSuccess = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      expect(result.current.apiKey).toBe('');
      expect(result.current.baseUrl).toBe('https://api.example.com');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with custom defaultBaseUrl', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'http://custom.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      expect(result.current.baseUrl).toBe('http://custom.example.com');
    });

    it('should provide all required handlers', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      expect(typeof result.current.handleApiKeyChange).toBe('function');
      expect(typeof result.current.handleBaseUrlChange).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('Input Handlers', () => {
    it('should update apiKey state when handleApiKeyChange is called', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('test-key-123');
      });

      expect(result.current.apiKey).toBe('test-key-123');
    });

    it('should update baseUrl state when handleBaseUrlChange is called', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleBaseUrlChange('https://new.example.com');
      });

      expect(result.current.baseUrl).toBe('https://new.example.com');
    });

    it('should clear error when apiKey changes', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      // Trigger validation error
      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).not.toBeNull();

      // Clear error by changing apiKey
      act(() => {
        result.current.handleApiKeyChange('test-key');
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear error when baseUrl changes', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: '',
          onSuccess: mockOnSuccess,
        })
      );

      // Trigger validation error
      act(() => {
        result.current.handleApiKeyChange('valid-key');
        result.current.handleSubmit();
      });

      expect(result.current.error).not.toBeNull();

      // Clear error by changing baseUrl
      act(() => {
        result.current.handleBaseUrlChange('https://api.example.com');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should validate and reject empty apiKey', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Please enter an API key');
    });

    it('should validate and reject whitespace-only apiKey', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('   ');
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Please enter an API key');
    });

    it('should validate and reject empty apiKey', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Please enter an API key');
    });
  });

  describe('Submission Validation', () => {
    it('should not call onSuccess when validation fails', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleSubmit();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should not call onSuccess when apiKey is empty', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('');
        result.current.handleSubmit();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should not call onSuccess when baseUrl is empty', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: '',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('valid-key');
        result.current.handleSubmit();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should not change isLoading on validation failure', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('URL Handling', () => {
    it('should accept HTTPS URLs', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://secure.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('test-key');
      });

      // URL is accepted during initialization
      expect(result.current.baseUrl).toBe('https://secure.example.com');
    });

    it('should accept HTTP URLs', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'http://example.com',
          onSuccess: mockOnSuccess,
        })
      );

      expect(result.current.baseUrl).toBe('http://example.com');
    });

    it('should accept URLs with port numbers', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://example.com:8080',
          onSuccess: mockOnSuccess,
        })
      );

      expect(result.current.baseUrl).toBe('https://example.com:8080');
    });

    it('should accept URLs with paths', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://example.com/api/v1',
          onSuccess: mockOnSuccess,
        })
      );

      expect(result.current.baseUrl).toBe('https://example.com/api/v1');
    });
  });

  describe('API Key Handling', () => {
    it('should handle API keys with alphanumeric characters', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('key123abc456');
      });

      expect(result.current.apiKey).toBe('key123abc456');
    });

    it('should handle API keys with special characters', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      const specialKey = 'key-123_456.abc/xyz==';

      act(() => {
        result.current.handleApiKeyChange(specialKey);
      });

      expect(result.current.apiKey).toBe(specialKey);
    });

    it('should accept long API keys', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      const longKey = 'a'.repeat(256);

      act(() => {
        result.current.handleApiKeyChange(longKey);
      });

      expect(result.current.apiKey).toBe(longKey);
    });
  });

  describe('Multiple Operations', () => {
    it('should handle multiple API key changes', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleApiKeyChange('key1');
      });
      expect(result.current.apiKey).toBe('key1');

      act(() => {
        result.current.handleApiKeyChange('key2');
      });
      expect(result.current.apiKey).toBe('key2');

      act(() => {
        result.current.handleApiKeyChange('key3');
      });
      expect(result.current.apiKey).toBe('key3');
    });

    it('should handle multiple URL changes', () => {
      const { result } = renderHook(() =>
        useSetupForm({
          defaultBaseUrl: 'https://api.example.com',
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.handleBaseUrlChange('https://first.com');
      });
      expect(result.current.baseUrl).toBe('https://first.com');

      act(() => {
        result.current.handleBaseUrlChange('https://second.com');
      });
      expect(result.current.baseUrl).toBe('https://second.com');
    });
  });
});
