import { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MapPin, Navigation, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, palette, fontFamily, fontSize } from '../../design';

interface AddressEmptyStateProps {
  onAddPress: () => void;
}

export const AddressEmptyState: React.FC<AddressEmptyStateProps> = ({ onAddPress }) => {
  const illustrationOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    illustrationOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    titleOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    );
    subtitleOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    );
    ctaOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    );
  }, [ctaOpacity, illustrationOpacity, subtitleOpacity, titleOpacity]);

  const illustrationStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddPress();
  };

  return (
    <View style={styles.container}>
      {/* 160x160 Illustration Container */}
      <Animated.View style={[styles.illustrationWrapper, illustrationStyle]}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <MapPin size={48} color={colors.primary} strokeWidth={2.2} />
            <View style={styles.accentBadge}>
              <Navigation size={16} color={palette.white} strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Staggered Title */}
      <Animated.Text
        style={[styles.title, titleStyle]}
        maxFontSizeMultiplier={1.3}
      >
        No saved addresses yet
      </Animated.Text>

      {/* Staggered Subtitle */}
      <Animated.Text
        style={[styles.subtitle, subtitleStyle]}
        maxFontSizeMultiplier={1.3}
      >
        Add an address to book services faster
      </Animated.Text>

      {/* Staggered CTA */}
      <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add Address"
        >
          <Plus size={18} color={colors.primaryDark} strokeWidth={2.5} />
          <Text style={styles.ctaText} maxFontSizeMultiplier={1.3}>
            Add Address
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  outerRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.green100,
  },
  innerRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.green500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
  },
  accentBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    lineHeight: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 260,
  },
  ctaWrapper: {
    width: '100%',
    maxWidth: 200,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 100,
    backgroundColor: palette.green50,
    borderWidth: 1.5,
    borderColor: palette.green200,
    paddingHorizontal: 20,
    gap: 8,
  },
  ctaButtonPressed: {
    backgroundColor: palette.green100,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primaryDark,
  },
});
