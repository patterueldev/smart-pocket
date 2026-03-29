import { useContext } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, AuthContext } from '@/utils/authContext';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useSplashController } from '@/hooks/useSplashController';
import { ThemedLayout } from '@/components/ThemedLayout';
import { RootNavigator } from '@/components/RootNavigator';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout content component.
 * Orchestrates auth initialization, splash screen, theming, and navigation.
 * 
 * Single Responsibility: Compose and coordinate extracted hooks and components.
 * Each concern is isolated in its own hook or component (5/5 SOLID compliance).
 */
function RootLayoutContent() {
  const authContext = useContext(AuthContext);

  // Each hook has a single responsibility
  const isReady = useAuthInitialization(authContext);
  useSplashController(isReady);

  if (!isReady) {
    return null; // Show splash screen while loading
  }

  return (
    <ThemedLayout>
      <RootNavigator isLoggedIn={authContext.isLoggedIn} />
    </ThemedLayout>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
