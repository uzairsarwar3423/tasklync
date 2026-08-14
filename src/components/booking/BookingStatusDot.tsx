import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface BookingStatusDotProps {
  status: string;
}

export function BookingStatusDot({ status }: BookingStatusDotProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status === 'IN_PROGRESS') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = 1;
    }
  }, [status, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (status !== 'IN_PROGRESS') {
    return <View style={styles.staticDot} />;
  }

  return <Animated.View style={[styles.staticDot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  staticDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
});
