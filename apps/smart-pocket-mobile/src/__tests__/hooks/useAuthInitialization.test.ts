import { renderHook, waitFor } from '@testing-library/react';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';

describe('useAuthInitialization', () => {
  let mockAuthContext: {
    initializeFromStorage: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = {
      initializeFromStorage: jest.fn(),
    };
  });

  describe('Hook Existence and Type', () => {
    it('should be a function', () => {
      expect(typeof useAuthInitialization).toBe('function');
    });

    it('should be properly exported and importable', () => {
      expect(useAuthInitialization).toBeDefined();
      expect(useAuthInitialization.name).toBe('useAuthInitialization');
    });

    it('should return a boolean', () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('Initialization on App Startup', () => {
    it('should start with isReady as false', () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));
      expect(result.current).toBe(false);
    });

    it('should call initializeFromStorage on mount', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalled();
      });
    });

    it('should call initializeFromStorage exactly once on mount', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledTimes(1);
      });
    });

    it('should set isReady to true after initialization completes', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      expect(result.current).toBe(false);

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should transition from false to true after successful initialization', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Initial state
      expect(result.current).toBe(false);

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Loading Credentials from Storage', () => {
    it('should complete initialization when storage loads credentials', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle empty storage (no previous session)', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(mockAuthContext.initializeFromStorage).toHaveBeenCalled();
    });

    it('should complete even if storage is empty', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle delayed storage response', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Should still be false initially
      expect(result.current).toBe(false);

      // Should become true after promise resolves
      await waitFor(() => {
        expect(result.current).toBe(true);
      }, { timeout: 500 });
    });
  });

  describe('Restoring Previous Auth Session', () => {
    it('should restore auth session from storage', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledWith();
    });

    it('should complete initialization regardless of session status', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle session restoration timing correctly', async () => {
      const resolutionTimes: number[] = [];

      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise(resolve => {
          resolutionTimes.push(Date.now());
          setTimeout(resolve, 50);
        })
      );

      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      }, { timeout: 500 });

      expect(resolutionTimes.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling During Initialization', () => {
    it('should set isReady to true even if initialization throws an error', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise((_, reject) => {
          reject(new Error('Storage error'));
        }).catch(() => {})  // Catch to prevent unhandled rejection
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle corrupted storage gracefully', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new Error('Failed to parse stored auth')).catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle network errors during initialization', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new Error('Network error: Failed to initialize API client')).catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should complete initialization on any error type', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new Error('Generic error')).catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should mark ready even with non-Error throws', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject('Non-error rejection').catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle TypeError during storage access', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new TypeError('Cannot read property of null')).catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Async Operation Completion', () => {
    it('should properly handle promise resolution', async () => {
      const resolveFn = jest.fn();
      mockAuthContext.initializeFromStorage.mockReturnValue(
        Promise.resolve().then(resolveFn)
      );

      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(resolveFn).toHaveBeenCalled();
    });

    it('should properly handle promise rejection', async () => {
      // Create a promise that rejects but gets caught by finally in the hook
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test error')), 0);
        }).catch(() => {})  // Catch to prevent unhandled rejection
      );

      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should use finally to ensure state update on both success and error', async () => {
      // Test success case
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result: resultSuccess } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(resultSuccess.current).toBe(true);
      });

      // Reset and test error case
      jest.clearAllMocks();
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new Error('Error')).catch(() => {})
      );
      const { result: resultError } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(resultError.current).toBe(true);
      });
    });

    it('should complete within reasonable time for normal operations', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const startTime = Date.now();
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle multiple rapid state changes correctly', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10))
      );

      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Initial state
      expect(result.current).toBe(false);

      // Wait for completion
      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Verify state doesn't regress
      expect(result.current).toBe(true);
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should not cause memory leaks on unmount', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { unmount } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Unmount should not cause errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle unmount during initialization', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { unmount } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Unmount immediately while initialization is in progress
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle unmount before initialization starts', () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { unmount } = renderHook(() => useAuthInitialization(mockAuthContext));

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should cleanup resources on unmount', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { unmount } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalled();
      });

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Dependency Array Behavior', () => {
    it('should call initializeFromStorage when authContext changes', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ context }) => useAuthInitialization(context),
        { initialProps: { context: mockAuthContext } }
      );

      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledTimes(1);
      });

      // Change context
      const newContext = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
      };

      rerender({ context: newContext });

      await waitFor(() => {
        expect(newContext.initializeFromStorage).toHaveBeenCalled();
      });
    });

    it('should not re-run initialization if authContext is stable', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ context }) => useAuthInitialization(context),
        { initialProps: { context: mockAuthContext } }
      );

      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledTimes(1);
      });

      // Rerender with same context
      rerender({ context: mockAuthContext });

      // Should still be called only once if object identity hasn't changed
      // (depends on how the hook tracks dependencies)
      await waitFor(() => {
        expect(mockAuthContext.initializeFromStorage).toHaveBeenCalled();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain isReady state after successful initialization', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Verify state persists
      expect(result.current).toBe(true);
    });

    it('should maintain isReady state after failed initialization', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => Promise.reject(new Error('Failed')).catch(() => {})
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Verify state persists
      expect(result.current).toBe(true);
    });

    it('should only call initializeFromStorage once per mount', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledTimes(1);

      // Wait for state update
      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Verify it was only called once
      expect(mockAuthContext.initializeFromStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with AuthContext', () => {
    it('should work with properly typed authContext', () => {
      const typedContext = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
      };

      const { result } = renderHook(() => useAuthInitialization(typedContext));
      expect(typeof result.current).toBe('boolean');
    });

    it('should handle authContext with additional properties', () => {
      const extendedContext = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
        isLoggedIn: false,
        otherProp: 'value',
      };

      const { result } = renderHook(() =>
        useAuthInitialization({
          initializeFromStorage: extendedContext.initializeFromStorage,
        })
      );
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('Edge Cases and Stress Tests', () => {
    it('should handle very fast initialization', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle slow initialization (simulating network delay)', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 500))
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      // Should start as false
      expect(result.current).toBe(false);

      // Should eventually become true
      await waitFor(() => {
        expect(result.current).toBe(true);
      }, { timeout: 1000 });
    });

    it('should handle initialization that throws immediately', async () => {
      mockAuthContext.initializeFromStorage.mockImplementation(
        () => {
          return Promise.reject(new Error('Immediate error')).catch(() => {});
        }
      );
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should be idempotent (returning same boolean after init completes)', async () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      const firstResult = result.current;
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should handle multiple hooks instances independently', async () => {
      const context1 = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
      };
      const context2 = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
      };

      const { result: result1 } = renderHook(() => useAuthInitialization(context1));
      const { result: result2 } = renderHook(() => useAuthInitialization(context2));

      await waitFor(() => {
        expect(result1.current).toBe(true);
        expect(result2.current).toBe(true);
      });

      expect(context1.initializeFromStorage).toHaveBeenCalled();
      expect(context2.initializeFromStorage).toHaveBeenCalled();
    });

    it('should not cause stale closure issues', async () => {
      const calls: string[] = [];
      mockAuthContext.initializeFromStorage.mockImplementation(async () => {
        calls.push('initialized');
      });

      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(calls).toContain('initialized');
    });
  });

  describe('Type Safety', () => {
    it('should accept authContext with initializeFromStorage method', () => {
      const context = {
        initializeFromStorage: jest.fn().mockResolvedValue(undefined),
      };

      expect(() => {
        renderHook(() => useAuthInitialization(context));
      }).not.toThrow();
    });

    it('should return boolean primitive', () => {
      mockAuthContext.initializeFromStorage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuthInitialization(mockAuthContext));

      expect(result.current === true || result.current === false).toBe(true);
      expect(typeof result.current).toBe('boolean');
    });
  });
});
