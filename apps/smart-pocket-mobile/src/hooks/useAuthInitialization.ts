import { useEffect, useState } from 'react';

/**
 * Custom hook to manage auth initialization from storage.
 * Initializes auth state on component mount and returns readiness state.
 * 
 * Single Responsibility: Only manages auth initialization logic.
 * 
 * @param authContext - The auth context with initializeFromStorage method
 * @returns A boolean indicating if initialization is complete
 */
export function useAuthInitialization(authContext: {
  initializeFromStorage: () => Promise<void>;
}): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    authContext.initializeFromStorage().finally(() => setIsReady(true));
  }, [authContext]);

  return isReady;
}
