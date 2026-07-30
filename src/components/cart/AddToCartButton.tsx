import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { springConfig } from '../../design/animations';

interface AddToCartButtonProps {
  serviceId: string;
  serviceName: string;
  price: number;
  workerId?: string | null | undefined;
  size?: 'sm' | 'md' | undefined;
  onAdd?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  style?: ViewStyle | undefined;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  serviceId,
  serviceName,
  price,
  workerId = null,
  size = 'sm',
  onAdd,
  onRemove,
  style,
}) => {
  const [count, setCount] = useState(0);

  // Reanimated Shared Values
  const widthVal = useSharedValue(size === 'sm' ? 80 : 90);
  const bgOpacity = useSharedValue(0); // 0 = transparent, 1 = primary
  const countScale = useSharedValue(0);
  const countOpacity = useSharedValue(0);
  const addTextOpacity = useSharedValue(1);

  // Separate haptic function
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const isSm = size === 'sm';
  const targetIdleWidth = isSm ? 80 : 90;
  const targetActiveWidth = isSm ? 108 : 120;
  const buttonHeight = isSm ? 32 : 38;

  // Run animations when count transitions from 0 -> 1 or 1 -> 0
  useEffect(() => {
    if (count > 0) {
      // Morph to Active State
      widthVal.value = withSpring(targetActiveWidth, springConfig.gentle);
      bgOpacity.value = withTiming(1, { duration: 150 });
      addTextOpacity.value = withTiming(0, { duration: 100 });
      countScale.value = withSpring(1, springConfig.bouncy);
      countOpacity.value = withTiming(1, { duration: 150 });
    } else {
      // Morph back to Idle State
      widthVal.value = withSpring(targetIdleWidth, springConfig.gentle);
      bgOpacity.value = withTiming(0, { duration: 150 });
      addTextOpacity.value = withTiming(1, { duration: 100 });
      countScale.value = withTiming(0, { duration: 100 });
      countOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [count, targetIdleWidth, targetActiveWidth]);

  const handleIncrement = (e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const newCount = count + 1;
    setCount(newCount);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (onAdd) onAdd();
  };

  const handleDecrement = (e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      if (onRemove) onRemove();
    }
  };

  const handleInitialAdd = (e: any) => {
    e.stopPropagation();
    setCount(1);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (onAdd) onAdd();
  };

  // Animated Styles
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      width: widthVal.value,
      backgroundColor: bgOpacity.value > 0.5 ? colors.primary : 'transparent',
      borderColor: colors.primary,
      borderWidth: bgOpacity.value > 0.5 ? 0 : 1.5,
    };
  });

  const addTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: addTextOpacity.value,
      display: addTextOpacity.value === 0 ? 'none' : 'flex',
    };
  });

  const countControlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: countOpacity.value,
      transform: [{ scale: countScale.value }],
      display: countOpacity.value === 0 ? 'none' : 'flex',
    };
  });

  const labelSize = isSm ? 13 : 14;

  return (
    <AnimatedPressable
      style={[
        styles.buttonContainer,
        { height: buttonHeight },
        animatedButtonStyle,
        style,
      ]}
      onPress={count === 0 ? handleInitialAdd : undefined}
      accessibilityRole="button"
      accessibilityLabel={
        count === 0
          ? `Add ${serviceName} to cart`
          : `${count} ${serviceName} in cart. Tap to change quantity.`
      }
    >
      {count === 0 ? (
        <Animated.View style={[styles.innerAddWrapper, addTextAnimatedStyle]}>
          <Text style={[styles.addSymbol, { fontSize: labelSize + 1 }]}>+</Text>
          <Text style={[styles.addText, { fontSize: labelSize }]}>Add</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.innerControlsWrapper, countControlsAnimatedStyle]}>
          <Pressable
            style={styles.controlZone}
            onPress={handleDecrement}
            hitSlop={8}
            accessibilityLabel="Decrease quantity"
          >
            <Text style={styles.controlText}>−</Text>
          </Pressable>

          <View style={styles.countWrapper}>
            <Text style={styles.countText}>{count}</Text>
          </View>

          <Pressable
            style={styles.controlZone}
            onPress={handleIncrement}
            hitSlop={8}
            accessibilityLabel="Increase quantity"
          >
            <Text style={styles.controlText}>+</Text>
          </Pressable>
        </Animated.View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
  },
  innerAddWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    height: '100%',
  },
  addSymbol: {
    fontFamily: typography.fontFamily.poppins.bold,
    color: colors.primary,
    includeFontPadding: false,
    lineHeight: 18,
  },
  addText: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    color: colors.primary,
    includeFontPadding: false,
  },
  innerControlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  controlZone: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontFamily: typography.fontFamily.poppins.bold,
    fontSize: 16,
    color: colors.textOnGreen,
    includeFontPadding: false,
  },
  countWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontFamily: typography.fontFamily.inter.bold,
    fontSize: 15,
    color: colors.textOnGreen,
    includeFontPadding: false,
  },
});
