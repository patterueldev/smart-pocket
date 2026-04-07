import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';

interface ThemedLayoutProps {
  children: ReactNode;
}

/**
 * Component that wraps content with theme provider and status bar.
 * Uses light theme exclusively.
 * 
 * Single Responsibility: Only manages theming and status bar configuration.
 */
export function ThemedLayout({ children }: ThemedLayoutProps) {
  return (
    <ThemeProvider value={DefaultTheme}>
      {children}
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
