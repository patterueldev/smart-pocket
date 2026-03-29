import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Custom hook to manage Expo SplashScreen lifecycle.
 * Hides the splash screen when the app is ready.
 * 
 * Single Responsibility: Only manages splash screen visibility.
 * 
 * @param isReady - Boolean indicating if the app is ready to show content
 */
export function useSplashController(isReady: boolean): void {
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);
}
