import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { queryClient, persistQueryCacheToMMKV } from '../config/queryClient';

export interface UseAppStateResult {
  appState: AppStateStatus;
  isForeground: boolean;
  isBackground: boolean;
}

/**
 * Custom hook for React Native AppState lifecycle management.
 * 
 * Features:
 * 1. Foreground transition: Targeted refetch of ONLY mounted, stale queries (no blanket refetch).
 * 2. Background transition: Immediate synchronous flush of MMKV caches.
 * 3. Backward compatible onForeground/onBackground callback support.
 */
export function useAppState(
  onForeground?: () => void,
  onBackground?: () => void
): UseAppStateResult {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const onForegroundRef = useRef(onForeground);
  const onBackgroundRef = useRef(onBackground);

  onForegroundRef.current = onForeground;
  onBackgroundRef.current = onBackground;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isEnteringForeground =
        appState.match(/inactive|background/) && nextAppState === 'active';
      const isEnteringBackground =
        appState === 'active' && nextAppState.match(/inactive|background/);

      if (isEnteringForeground) {
        // Targeted refetch of only currently mounted, stale queries (Section 2.2)
        queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });

        onForegroundRef.current?.();
      } else if (isEnteringBackground) {
        // Flush pending query cache and MMKV writes synchronously
        persistQueryCacheToMMKV();

        onBackgroundRef.current?.();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return {
    appState,
    isForeground: appState === 'active',
    isBackground: appState === 'background',
  };
}
