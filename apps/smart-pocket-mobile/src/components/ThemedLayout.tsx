import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ThemedLayoutProps {
  children: ReactNode;
}

/**
 * Component that wraps content with theme provider and status bar.
 * Applies theme based on system color scheme (light/dark).
 * 
 * Single Responsibility: Only manages theming and status bar configuration.
 */
export function ThemedLayout({ children }: ThemedLayoutProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      {children}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
