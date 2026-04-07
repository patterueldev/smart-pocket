import { Stack } from 'expo-router';

interface RootNavigatorProps {
  isLoggedIn: boolean;
}

/**
 * Component that manages the root navigation stack.
 * Conditionally renders the setup or protected routes based on authentication state.
 * 
 * Single Responsibility: Only manages navigation routing logic.
 */
export function RootNavigator({ isLoggedIn }: RootNavigatorProps) {
  return (
    <Stack>
      <Stack.Screen
        name={isLoggedIn ? '(protected)' : 'setup'}
        options={{ headerShown: false, animation: 'none' }}
      />
      {isLoggedIn && (
        <Stack.Screen
          name="setup"
          options={{ headerShown: false, animation: 'none' }}
        />
      )}
      {!isLoggedIn && (
        <Stack.Screen
          name="(protected)"
          options={{ headerShown: false, animation: 'none' }}
        />
      )}
    </Stack>
  );
}
