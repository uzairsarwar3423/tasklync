import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '../../design';

interface AddressCardSkeletonProps {
  delayMs?: number | undefined;
}

export const AddressCardSkeleton: React.FC<AddressCardSkeletonProps> = ({
  delayMs = 300,
}) => {
  const [shouldRender, setShouldRender] = useState(delayMs === 0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (delayMs > 0) {
      timer = setTimeout(() => {
        setShouldRender(true);
      }, delayMs);
    }

    opacity.value = withRepeat(
      withTiming(0.85, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [delayMs, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shouldRender) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Skeleton 40px Icon */}
        <Animated.View style={[styles.iconCircle, animatedStyle]} />

        {/* Skeleton Text Container */}
        <View style={styles.textContainer}>
          <Animated.View style={[styles.titleLine, animatedStyle]} />
          <Animated.View style={[styles.streetLine, animatedStyle]} />
        </View>

        {/* Skeleton Badge Area */}
        <Animated.View style={[styles.badgeSkeleton, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: palette.white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.gray200,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.mintHaze,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleLine: {
    width: 100,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.mintHaze,
    marginBottom: 8,
  },
  streetLine: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.mintHaze,
  },
  badgeSkeleton: {
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.mintHaze,
  },
});
