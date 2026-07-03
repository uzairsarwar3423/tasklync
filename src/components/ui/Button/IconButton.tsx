import React, { useCallback } from 'react';
import { ViewStyle, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@design/colors';
import { springConfig } from '@design/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps {
  icon: React.ElementType;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  bg?: string;
  bgPressed?: string;
  style?: ViewStyle;
  accessibilityLabel: string;
  disabled?: boolean;
}

export const IconButton = ({
  icon: Icon,
  onPress,
  size = 40,
  iconSize = 20,
  color = colors.textSecondary,
  bg = colors.bgInput,
  bgPressed = '#E9EAEC',
  style,
  accessibilityLabel,
  disabled = false,
}: IconButtonProps) => {
  const scale = useSharedValue(1.0);
  const isPressed = useSharedValue(0); // 0 = idle, 1 = pressed

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    isPressed.value = 1;
    scale.value = withSpring(0.90, springConfig.stiff);
  }, [disabled, isPressed, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    isPressed.value = 0;
    scale.value = withSpring(1.0, springConfig.bouncy); // Overshoots to 1.05 naturally via bouncy config
  }, [disabled, isPressed, scale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      isPressed.value,
      [0, 1],
      [bg, bgPressed]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: disabled ? bg : backgroundColor,
      opacity: disabled ? 0.5 : 1.0,
    };
  });

  // Fitts' law calculations
  const minTouchTarget = 44;
  const touchExtra = size < minTouchTarget ? (minTouchTarget - size) / 2 : 0;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={touchExtra}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
        style,
      ]}
    >
      <Icon size={iconSize} color={color} />
    </AnimatedPressable>
  );
};
