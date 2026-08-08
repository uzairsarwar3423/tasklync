import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useBookingDraftStore } from '../../../store/bookingDraft.store';
import { colors, palette, fontFamily } from '../../../design';

export interface SuccessCTAGroupProps {
  bookingId: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SuccessCTAGroup: React.FC<SuccessCTAGroupProps> = ({ bookingId }) => {
  const router = useRouter();
  const resetDraft = useBookingDraftStore((s) => s.resetDraft);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
  }, [opacity]);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1.0, { duration: 80 });
  };

  const handleTrackBooking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/booking/[id]/track',
      params: { id: bookingId },
    } as any);
  };

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetDraft();
    router.replace('/(tabs)' as any);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Primary Action Button: Track Booking */}
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleTrackBooking}
        style={[styles.primaryButton, buttonAnimatedStyle]}
        accessibilityRole="button"
        accessibilityLabel="Track booking status"
      >
        <Text style={styles.primaryText}>Track Booking</Text>
      </AnimatedPressable>

      {/* Secondary Text Action: Back to Home */}
      <Pressable
        onPress={handleBackToHome}
        style={styles.secondaryLink}
        accessibilityRole="button"
        accessibilityLabel="Return to home screen"
      >
        <Text style={styles.secondaryText}>Back to Home</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 14,
  },
  primaryText: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: 16,
    color: palette.white,
  },
  secondaryLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
