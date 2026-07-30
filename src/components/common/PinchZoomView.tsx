import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface PinchZoomViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number) => void;
  style?: ViewStyle;
}

export const PinchZoomView = ({
  children,
  minScale = 1.0,
  maxScale = 4.0,
  onZoomChange,
  style,
}: PinchZoomViewProps) => {
  const { width, height } = useWindowDimensions();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const calculateBoundary = () => {
    'worklet';
    if (scale.value <= 1) return { x: 0, y: 0 };
    
    // Approximate boundary clamp
    const maxTx = (width * (scale.value - 1)) / 2;
    const maxTy = (height * (scale.value - 1)) / 2;
    
    return {
      x: Math.max(-maxTx, Math.min(translateX.value, maxTx)),
      y: Math.max(-maxTy, Math.min(translateY.value, maxTy)),
    };
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onChange((e) => {
      scale.value = Math.max(minScale * 0.8, Math.min(savedScale.value * e.scale, maxScale * 1.2));
    })
    .onEnd(() => {
      if (scale.value < minScale) {
        scale.value = withSpring(minScale);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else if (scale.value > maxScale) {
        scale.value = withSpring(maxScale);
      }
      
      const bounds = calculateBoundary();
      translateX.value = withSpring(bounds.x);
      translateY.value = withSpring(bounds.y);
      
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onChange((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        const bounds = calculateBoundary();
        translateX.value = withSpring(bounds.x);
        translateY.value = withSpring(bounds.y);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const gestures = Gesture.Simultaneous(pinchGesture, panGesture);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
