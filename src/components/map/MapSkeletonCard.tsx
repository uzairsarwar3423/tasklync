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

export const MapSkeletonCard: FC = () => {
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
    <View style={styles.card}>
      {/* Avatar circle skeleton */}
      <Animated.View style={[styles.avatarSkeleton, shimmerStyle]} />

      {/* Content lines skeleton */}
      <View style={styles.contentContainer}>
        {/* Name line */}
        <Animated.View style={[styles.nameLine, shimmerStyle]} />
        {/* Rating & Distance line */}
        <Animated.View style={[styles.subLine, shimmerStyle]} />
        {/* Category chip tag line */}
        <Animated.View style={[styles.tagLine, shimmerStyle]} />
      </View>

      {/* Book CTA button skeleton */}
      <Animated.View style={[styles.buttonSkeleton, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 270,
    height: 146, // Exact height matching real MapWorkerCard
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgSkeleton,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 8,
  },
  nameLine: {
    width: '80%',
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.bgSkeleton,
  },
  subLine: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgSkeleton,
  },
  tagLine: {
    width: '50%',
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bgSkeleton,
  },
  buttonSkeleton: {
    width: 64,
    height: 44, // 44px Fitts's Law button height match
    borderRadius: 12,
    backgroundColor: colors.bgSkeleton,
    marginLeft: 8,
  },
});
