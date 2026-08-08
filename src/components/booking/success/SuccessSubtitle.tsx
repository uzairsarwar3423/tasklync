import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, palette, fontFamily } from '../../../design';

export interface SuccessSubtitleProps {
  bookingId: string;
  subtitle?: string;
}

export const SuccessSubtitle: React.FC<SuccessSubtitleProps> = ({
  bookingId,
  subtitle = 'Your service request has been sent to the professional.',
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.subtitleText}>{subtitle}</Text>
      <View style={styles.idBadge}>
        <Text style={styles.idLabel}>BOOKING ID:</Text>
        <Text style={styles.idValue}> #{bookingId}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  subtitleText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.gray100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  idLabel: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  idValue: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
});
