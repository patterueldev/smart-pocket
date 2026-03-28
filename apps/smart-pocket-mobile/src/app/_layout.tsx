import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/utils/authContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none' }} />
                    <Stack.Screen name="login" options={{ headerShown: false, animation: 'none' }} />
                    <StatusBar style="auto" />
                </Stack>
            </AuthProvider>
        </ThemeProvider>
    );
}
