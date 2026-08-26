import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, palette, radius, spacing, shadows } from '../../design';

export const PaymentMethodCardSkeleton: React.FC = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Icon Placeholder */}
      <Animated.View style={[styles.iconPlaceholder, animatedStyle]} />

      {/* Text Lines */}
      <View style={styles.textContainer}>
        <Animated.View style={[styles.titlePlaceholder, animatedStyle]} />
        <Animated.View style={[styles.subtitlePlaceholder, animatedStyle]} />
      </View>

      {/* Trailing Chip */}
      <Animated.View style={[styles.chipPlaceholder, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm + 2,
    ...shadows.xs,
  },
  iconPlaceholder: {
    width: 36,
    height: 24,
    borderRadius: 5,
    backgroundColor: palette.gray200,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  titlePlaceholder: {
    width: '55%',
    height: 14,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
  subtitlePlaceholder: {
    width: '35%',
    height: 11,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
  chipPlaceholder: {
    width: 50,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: palette.gray200,
  },
});
