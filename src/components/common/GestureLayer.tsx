import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';

interface GestureLayerProps {
  onSingleTap?: () => void;
  onDoubleTap?: (x: number, y: number) => void;
  onSwipeDown?: (velocity: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const GestureLayer = ({
  onSingleTap,
  onDoubleTap,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,
  disabled = false,
}: GestureLayerProps) => {
  
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (disabled) return;
      if (onSingleTap) runOnJS(onSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((e) => {
      if (onDoubleTap) runOnJS(onDoubleTap)(e.x, e.y);
    });

  // Requires singleTap to wait for doubleTap to fail
  singleTap.requireExternalGestureToFail(doubleTap);

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      if (disabled) return;

      const { translationX, translationY, velocityX, velocityY } = e;
      const swipeThreshold = 50; // pixels to be considered a swipe
      
      // Determine dominant axis
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        if (translationX > swipeThreshold || velocityX > 500) {
          if (onSwipeRight) runOnJS(onSwipeRight)();
        } else if (translationX < -swipeThreshold || velocityX < -500) {
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
        }
      } else {
        // Vertical swipe
        if (translationY > swipeThreshold || velocityY > 500) {
          if (onSwipeDown) runOnJS(onSwipeDown)(velocityY);
        }
      }
    });

  const gestures = Gesture.Simultaneous(Gesture.Exclusive(doubleTap, singleTap), panGesture);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={styles.container}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
