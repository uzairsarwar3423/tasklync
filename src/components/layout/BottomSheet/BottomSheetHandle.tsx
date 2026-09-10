import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { springConfig } from '../../../design/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BottomSheetHandle = () => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(1.2, springConfig.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, springConfig.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.touchArea, animatedStyle]}
      >
        <View style={styles.handle} />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10, // 10 top, 8 bottom roughly achieved by 10 padding + handle size
  },
  touchArea: {
    width: 40,
    height: 28, // 28px height comfortable drag zone
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
});
