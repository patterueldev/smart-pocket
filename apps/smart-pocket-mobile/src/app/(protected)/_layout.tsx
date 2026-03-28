import { AuthContext } from '@/utils/authContext';
import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);
  if (!authState.isLoggedIn) {
    // If not logged in, redirect to login screen
    // Use absolute path from root
    return <Redirect href="/login" />;
  }
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
  );
}
