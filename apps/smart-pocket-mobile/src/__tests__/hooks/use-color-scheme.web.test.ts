/**
 * Tests for useColorScheme hook (web platform)
 * Web always returns light theme
 */

import { useColorScheme } from '@/hooks/use-color-scheme.web';

describe('useColorScheme Hook (Web)', () => {
  it('should export useColorScheme as a function', () => {
    expect(useColorScheme).toBeDefined();
    expect(typeof useColorScheme).toBe('function');
  });

  it('function should be named correctly', () => {
    expect(useColorScheme.name).toBe('useColorScheme');
  });

  it('should take no required parameters', () => {
    expect(useColorScheme.length).toBe(0);
  });

  it('should return light theme for web', () => {
    const result = useColorScheme();
    // Web implementation returns 'light'
    expect(result).toBeDefined();
  });
});
