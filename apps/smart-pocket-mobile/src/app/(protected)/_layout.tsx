import { AuthContext } from '@/utils/authContext';
import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'dashboard',
};

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);
  if (!authState.isLoggedIn) {
    // If not logged in, redirect to setup screen
    return <Redirect href="/setup" />;
  }
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="sync" options={{ title: 'Google Sheets Sync' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
