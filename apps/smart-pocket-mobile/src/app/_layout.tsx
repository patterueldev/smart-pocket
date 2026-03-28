import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, AuthContext } from '@/utils/authContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);

  // On mount, initialize auth from storage
  useEffect(() => {
    authContext.initializeFromStorage();
  }, [authContext]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {!authContext.isLoggedIn && (
          <Stack.Screen name="setup" options={{ headerShown: false, animation: 'none' }} />
        )}
        {authContext.isLoggedIn && (
          <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none' }} />
        )}
        <StatusBar style="auto" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
