import { useState, useCallback, useRef } from 'react';
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface UseScrollPositionOptions {
  /**
   * Threshold in pixels from bottom (inverted FlatList offset near 0) to consider "at bottom".
   * Defaults to 50px.
   */
  bottomThreshold?: number;
}

export function useScrollPosition(options: UseScrollPositionOptions = {}) {
  const { bottomThreshold = 50 } = options;
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [distanceFromBottom, setDistanceFromBottom] = useState<number>(0);
  const isAtBottomRef = useRef<boolean>(true);

  /**
   * Tracks FlatList scroll event.
   * In an inverted FlatList (inverted={true}):
   * - contentOffset.y <= 0 (or within threshold) means the user is at the bottom (newest messages).
   * - contentOffset.y > threshold means the user has scrolled up into history.
   */
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const atBottom = offsetY <= bottomThreshold;

      setDistanceFromBottom(Math.max(0, offsetY));
      if (isAtBottomRef.current !== atBottom) {
        isAtBottomRef.current = atBottom;
        setIsAtBottom(atBottom);
      }
    },
    [bottomThreshold]
  );

  return {
    isAtBottom,
    distanceFromBottom,
    handleScroll,
    isAtBottomRef,
  };
}
