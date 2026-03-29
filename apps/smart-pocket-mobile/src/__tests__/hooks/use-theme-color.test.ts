/**
 * Tests for useThemeColor hook
 * Tests color resolution based on theme (light/dark) and custom props
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Mock the useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

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
    dark: {
      text: '#ffffff',
      background: '#000000',
      tint: '#fff',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: '#fff',
    },
  },
}));

describe('useThemeColor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Light Theme', () => {
    beforeEach(() => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
    });

    it('should return light theme color when theme is light', () => {
      const result = useThemeColor({}, 'text');
      expect(result).toBe('#000000');
    });

    it('should return correct light background color', () => {
      const result = useThemeColor({}, 'background');
      expect(result).toBe('#ffffff');
    });

    it('should return correct light tint color', () => {
      const result = useThemeColor({}, 'tint');
      expect(result).toBe('#0a7ea4');
    });

    it('should return light tabIconDefault color', () => {
      const result = useThemeColor({}, 'tabIconDefault');
      expect(result).toBe('#687076');
    });

    it('should return light tabIconSelected color', () => {
      const result = useThemeColor({}, 'tabIconSelected');
      expect(result).toBe('#0a7ea4');
    });

    it('should prefer custom light prop over theme default', () => {
      const result = useThemeColor({ light: '#ff0000' }, 'text');
      expect(result).toBe('#ff0000');
    });

    it('should ignore dark prop in light theme', () => {
      const result = useThemeColor({ dark: '#0000ff' }, 'text');
      expect(result).toBe('#000000');
    });

    it('should use custom light prop when both light and dark are provided', () => {
      const result = useThemeColor(
        { light: '#ff0000', dark: '#0000ff' },
        'text'
      );
      expect(result).toBe('#ff0000');
    });
  });

  describe('Dark Theme', () => {
    beforeEach(() => {
      (useColorScheme as jest.Mock).mockReturnValue('dark');
    });

    it('should return dark theme color when theme is dark', () => {
      const result = useThemeColor({}, 'text');
      expect(result).toBe('#ffffff');
    });

    it('should return correct dark background color', () => {
      const result = useThemeColor({}, 'background');
      expect(result).toBe('#000000');
    });

    it('should return correct dark tint color', () => {
      const result = useThemeColor({}, 'tint');
      expect(result).toBe('#fff');
    });

    it('should return dark tabIconDefault color', () => {
      const result = useThemeColor({}, 'tabIconDefault');
      expect(result).toBe('#9BA1A6');
    });

    it('should return dark tabIconSelected color', () => {
      const result = useThemeColor({}, 'tabIconSelected');
      expect(result).toBe('#fff');
    });

    it('should prefer custom dark prop over theme default', () => {
      const result = useThemeColor({ dark: '#0000ff' }, 'text');
      expect(result).toBe('#0000ff');
    });

    it('should ignore light prop in dark theme', () => {
      const result = useThemeColor({ light: '#ff0000' }, 'text');
      expect(result).toBe('#ffffff');
    });

    it('should use custom dark prop when both light and dark are provided', () => {
      const result = useThemeColor(
        { light: '#ff0000', dark: '#0000ff' },
        'text'
      );
      expect(result).toBe('#0000ff');
    });
  });

  describe('Theme Switch (null to light/dark)', () => {
    it('should handle null theme by defaulting to light', () => {
      (useColorScheme as jest.Mock).mockReturnValue(null);
      const result = useThemeColor({}, 'text');
      expect(result).toBe('#000000');
    });

    it('should return light theme color when colorScheme returns null', () => {
      (useColorScheme as jest.Mock).mockReturnValue(null);
      const result = useThemeColor({}, 'background');
      expect(result).toBe('#ffffff');
    });

    it('should handle theme switching from light to dark', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const lightResult = useThemeColor({}, 'text');

      (useColorScheme as jest.Mock).mockReturnValue('dark');
      const darkResult = useThemeColor({}, 'text');

      expect(lightResult).not.toBe(darkResult);
      expect(lightResult).toBe('#000000');
      expect(darkResult).toBe('#ffffff');
    });

    it('should handle theme switching from dark to light', () => {
      (useColorScheme as jest.Mock).mockReturnValue('dark');
      const darkResult = useThemeColor({}, 'text');

      (useColorScheme as jest.Mock).mockReturnValue('light');
      const lightResult = useThemeColor({}, 'text');

      expect(darkResult).not.toBe(lightResult);
      expect(darkResult).toBe('#ffffff');
      expect(lightResult).toBe('#000000');
    });
  });

  describe('Custom Props Override', () => {
    it('should prioritize custom props over theme defaults', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const customColor = '#ff6b6b';
      const result = useThemeColor({ light: customColor }, 'text');

      expect(result).toBe(customColor);
      expect(result).not.toBe(Colors.light.text);
    });

    it('should handle empty custom props object', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const result = useThemeColor({}, 'text');

      expect(result).toBe(Colors.light.text);
    });

    it('should handle undefined custom props', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const result = useThemeColor({ light: undefined }, 'text');

      expect(result).toBe(Colors.light.text);
    });

    it('should handle empty string custom prop (treated as falsy)', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const result = useThemeColor({ light: '' }, 'text');

      expect(result).toBe(Colors.light.text);
    });

    it('should return custom prop when it has truthy value', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const result = useThemeColor({ light: '#123456' }, 'text');

      expect(result).toBe('#123456');
    });
  });

  describe('All Theme Colors Available', () => {
    it('should provide access to all light theme colors', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const colors = ['text', 'background', 'tint', 'tabIconDefault', 'tabIconSelected'] as const;

      colors.forEach((colorName) => {
        const result = useThemeColor({}, colorName);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^#/); // Should be hex color
      });
    });

    it('should provide access to all dark theme colors', () => {
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const colors = ['text', 'background', 'tint', 'tabIconDefault', 'tabIconSelected'] as const;

      colors.forEach((colorName) => {
        const result = useThemeColor({}, colorName);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^#/); // Should be hex color
      });
    });

    it('should have different values for light and dark themes', () => {
      const colors = ['text', 'background', 'tint', 'tabIconDefault', 'tabIconSelected'] as const;

      colors.forEach((colorName) => {
        (useColorScheme as jest.Mock).mockReturnValue('light');
        const lightColor = useThemeColor({}, colorName);

        (useColorScheme as jest.Mock).mockReturnValue('dark');
        const darkColor = useThemeColor({}, colorName);

        // text and background should definitely be different
        if (colorName === 'text' || colorName === 'background') {
          expect(lightColor).not.toBe(darkColor);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle colorScheme hook returning different values', () => {
      const schemes = ['light', 'dark', null];

      schemes.forEach((scheme) => {
        (useColorScheme as jest.Mock).mockReturnValue(scheme);
        const result = useThemeColor({}, 'text');

        // Should return a valid color string
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    it('should work with various color formats', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      // Hex colors
      const hexResult = useThemeColor({ light: '#ff0000' }, 'text');
      expect(hexResult).toBe('#ff0000');

      // Short hex
      const shortHexResult = useThemeColor({ light: '#f00' }, 'text');
      expect(shortHexResult).toBe('#f00');
    });

    it('should be deterministic (same inputs = same outputs)', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const result1 = useThemeColor({ light: '#ff0000' }, 'text');
      const result2 = useThemeColor({ light: '#ff0000' }, 'text');

      expect(result1).toBe(result2);
    });
  });

  describe('Component Integration', () => {
    it('should work with themed props object pattern', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const themedProps = {
        light: '#rgb(100, 200, 50)',
        dark: '#rgb(200, 100, 50)',
      };

      const result = useThemeColor(themedProps, 'text');
      expect(result).toBe(themedProps.light);
    });

    it('should work without custom props', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const result = useThemeColor({}, 'text');
      expect(result).toBeDefined();
    });

    it('should support partial props object', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      // Only dark prop provided, light is undefined
      const result = useThemeColor({ dark: '#0000ff' }, 'text');

      // Should use light theme default since theme is 'light'
      expect(result).toBe(Colors.light.text);
    });
  });

  describe('Type System', () => {
    it('should return string type', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const result = useThemeColor({}, 'text');

      expect(typeof result).toBe('string');
    });

    it('should handle colorName parameter of correct type', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const validColorNames = ['text', 'background', 'tint', 'tabIconDefault', 'tabIconSelected'] as const;

      validColorNames.forEach((colorName) => {
        const result = useThemeColor({}, colorName);
        expect(result).toBeDefined();
      });
    });
  });
});
