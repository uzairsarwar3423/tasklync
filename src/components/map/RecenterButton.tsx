import { FC, useEffect } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { springConfig } from '../../design/animations';

interface RecenterButtonProps {
  visible: boolean;
  onRecenter: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RecenterButton: FC<RecenterButtonProps> = ({
  visible,
  onRecenter,
}) => {
  const scale = useSharedValue(visible ? 1 : 0);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1.0, springConfig.default);
      opacity.value = withSpring(1.0, springConfig.default);
    } else {
      scale.value = withSpring(0.8, springConfig.stiff);
      opacity.value = withSpring(0, springConfig.stiff);
    }
  }, [visible, scale, opacity]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onRecenter();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none',
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPress={handlePress}
      hitSlop={8}
      accessibilityLabel="Recenter map on current location"
      accessibilityRole="button"
    >
      <Navigation size={20} color={colors.primaryDark} style={styles.icon} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44, // Fitts's Law: 44px minimum touch target
    borderRadius: 22,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    transform: [{ rotate: '45deg' }],
  },
});
