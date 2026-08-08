import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '../../../design';

export const TimeSlotSkeleton: React.FC = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.chipWrapper}>
      <Animated.View style={[styles.skeletonPill, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  chipWrapper: {
    width: '31.5%',
    marginBottom: 10,
  },
  skeletonPill: {
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.mintHaze,
  },
});
