import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '../../design';

export const PaymentMethodSkeleton: React.FC = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <Animated.View style={[styles.iconCircle, animatedStyle]} />
        <View style={styles.textContainer}>
          <Animated.View style={[styles.titleLine, animatedStyle]} />
          <Animated.View style={[styles.subLine, animatedStyle]} />
        </View>
        <Animated.View style={[styles.radioCircle, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.mintHaze,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleLine: {
    width: 140,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.mintHaze,
    marginBottom: 8,
  },
  subLine: {
    width: 100,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.mintHaze,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.mintHaze,
  },
});
