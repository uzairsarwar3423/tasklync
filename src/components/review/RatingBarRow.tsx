import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';
import { radius } from '@design/radius';

interface RatingBarRowProps {
  label: string;
  value: number | null;
  maxValue?: number;
  animated?: boolean;
  animationDelay?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

const springConfig = {
  damping: 20,
  stiffness: 90,
  mass: 1,
};

export const RatingBarRow = ({
  label,
  value,
  maxValue = 5,
  animated = false,
  animationDelay = 0,
  trackColor = colors.border,
  fillColor = colors.primary,
  style,
}: RatingBarRowProps) => {
  const targetPercent = value !== null ? (value / maxValue) * 100 : 0;
  const widthPercent = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      widthPercent.value = withDelay(
        animationDelay,
        withSpring(targetPercent, springConfig)
      );
    } else {
      widthPercent.value = targetPercent;
    }
  }, [animated, targetPercent, animationDelay, widthPercent]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthPercent.value}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>

      {/* Bar Track */}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: fillColor },
            animatedStyle,
          ]}
        />
      </View>

      {/* Score */}
      <Text style={styles.scoreText}>
        {value !== null ? value.toFixed(1) : '—'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelText: {
    width: 110,
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  scoreText: {
    width: 30,
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
