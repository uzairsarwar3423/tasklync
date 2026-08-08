import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamily } from '../../../design';

export interface SuccessHeadlineProps {
  title?: string;
}

export const SuccessHeadline: React.FC<SuccessHeadlineProps> = ({
  title = 'Booking Confirmed!',
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.headline, animatedStyle]}>
      {title}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  headline: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
});
