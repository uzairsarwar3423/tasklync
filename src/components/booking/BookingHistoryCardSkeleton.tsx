import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, palette, radius, spacing, shadows } from '../../design';

export const BookingHistoryCardSkeleton: React.FC = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 750 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      {/* Left Icon Placeholder */}
      <Animated.View style={[styles.iconPlaceholder, animatedStyle]} />

      {/* Middle Text Placeholders */}
      <View style={styles.middleContainer}>
        <Animated.View style={[styles.titlePlaceholder, animatedStyle]} />
        <Animated.View style={[styles.subtitlePlaceholder, animatedStyle]} />
      </View>

      {/* Right Amount/Date Placeholders */}
      <View style={styles.rightContainer}>
        <Animated.View style={[styles.amountPlaceholder, animatedStyle]} />
        <Animated.View style={[styles.datePlaceholder, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.gray200,
    marginRight: spacing.md,
  },
  middleContainer: {
    flex: 1,
    gap: 6,
    marginRight: spacing.sm,
  },
  titlePlaceholder: {
    width: '65%',
    height: 14,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
  subtitlePlaceholder: {
    width: '45%',
    height: 11,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountPlaceholder: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
  datePlaceholder: {
    width: 45,
    height: 11,
    borderRadius: 4,
    backgroundColor: palette.gray200,
  },
});
