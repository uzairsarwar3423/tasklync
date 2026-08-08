import { FC } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { springConfig } from '../../design/animations';

interface ProceedFooterProps {
  total: number;
  itemCount: number;
  onProceed?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProceedFooter: FC<ProceedFooterProps> = ({
  total,
  itemCount,
  onProceed,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scale = useSharedValue(1);

  const isEnabled = itemCount > 0;

  const handlePressIn = () => {
    if (!isEnabled) return;
    scale.value = withSpring(0.97, springConfig.stiff);
  };

  const handlePressOut = () => {
    if (!isEnabled) return;
    scale.value = withSpring(1.0, springConfig.bouncy);
  };

  const handleProceed = () => {
    if (!isEnabled) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    if (onProceed) {
      onProceed();
    } else {
      router.push('/booking/schedule' as any);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formattedTotal = `Rs. ${total.toLocaleString()}`;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <AnimatedPressable
        style={[
          styles.button,
          isEnabled ? styles.enabledButton : styles.disabledButton,
          animatedButtonStyle,
        ]}
        onPress={handleProceed}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isEnabled}
        accessibilityRole="button"
        accessibilityLabel={`Proceed to booking, total ${formattedTotal}`}
      >
        <View style={styles.contentRow}>
          {/* Poppins font for CTA label */}
          <Text style={[styles.ctaText, !isEnabled && styles.disabledText]}>
            Proceed to Booking
          </Text>

          {isEnabled && (
            <View style={styles.rightGroup}>
              {/* Inter font for total inside CTA */}
              <Text style={styles.priceBadgeText}>{formattedTotal}</Text>
              <ArrowRight size={18} color={colors.textOnGreen} />
            </View>
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    height: 52, // Fitts's Law: 52px height CTA
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  enabledButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.bgSkeleton,
  },
  contentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    fontFamily: typography.fontFamily.poppins.bold, // Poppins font for CTA label
    fontSize: typography.fontSize.body1,
    color: colors.textOnGreen,
  },
  disabledText: {
    color: colors.textMuted,
    textAlign: 'center',
    width: '100%',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceBadgeText: {
    fontFamily: typography.fontFamily.inter.bold, // Inter font for price badge inside CTA
    fontSize: typography.fontSize.body2,
    color: colors.textOnGreen,
  },
});
