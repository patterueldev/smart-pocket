/**
 * Tests for useThemeColor hook
 * Tests color resolution based on theme colors
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

// Mock Colors constant
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      text: '#000000',
      background: '#ffffff',
      tint: '#0a7ea4',
      tabIconDefault: '#687076',
      tabIconSelected: '#0a7ea4',
    },
  },
}));

describe('useThemeColor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return text color from theme', () => {
    const result = useThemeColor({}, 'text');
    expect(result).toBe('#000000');
  });

  it('should return background color from theme', () => {
    const result = useThemeColor({}, 'background');
    expect(result).toBe('#ffffff');
  });

  it('should return tint color from theme', () => {
    const result = useThemeColor({}, 'tint');
    expect(result).toBe('#0a7ea4');
  });

  it('should return custom light color when provided', () => {
    const customColor = '#ff0000';
    const result = useThemeColor({ light: customColor }, 'text');
    expect(result).toBe(customColor);
  });

  it('should return theme color when custom color is not provided', () => {
    const result = useThemeColor({}, 'text');
    expect(result).toBe(Colors.light.text);
  });

  it('should return tab icon default color from theme', () => {
    const result = useThemeColor({}, 'tabIconDefault');
    expect(result).toBe('#687076');
  });

  it('should return tab icon selected color from theme', () => {
    const result = useThemeColor({}, 'tabIconSelected');
    expect(result).toBe('#0a7ea4');
  });
});
