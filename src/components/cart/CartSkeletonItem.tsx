import { FC, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../design/colors';

export const CartSkeletonItem: FC = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 800, easing: Easing.ease }),
        withTiming(0.4, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.skeletonRow}>
      <View style={styles.textContainer}>
        {/* Service name line */}
        <Animated.View style={[styles.nameLine, shimmerStyle]} />
        {/* Price line */}
        <Animated.View style={[styles.priceLine, shimmerStyle]} />
      </View>

      {/* Stepper shape block */}
      <Animated.View style={[styles.stepperBlock, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonRow: {
    height: 74, // Pixel-matched height to CartItem
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  nameLine: {
    width: '65%',
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.bgSkeleton,
  },
  priceLine: {
    width: '35%',
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.bgSkeleton,
  },
  stepperBlock: {
    width: 90,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgSkeleton,
  },
});
