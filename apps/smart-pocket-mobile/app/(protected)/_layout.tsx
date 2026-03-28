import { Redirect, Stack } from 'expo-router';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const isLoggedIn = false; // Replace with actual auth logic

export default function ProtectedLayout() {
  if (!isLoggedIn) {
    // If not logged in, show the sign-in screen
    return <Redirect href="/login" />;
  }
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
  );
}
