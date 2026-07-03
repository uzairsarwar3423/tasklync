import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text/Text';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { layout } from '../../design/spacing';
import { fontFamily } from '../../design/typography';

export const SearchPromptBar = () => {
  const router = useRouter();
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(0);
  const borderColor = useSharedValue('transparent');

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { stiffness: 400, damping: 20 });
    borderWidth.value = 1.5;
    borderColor.value = colors.primary;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    borderWidth.value = 0;
    borderColor.value = 'transparent';
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push('/search' as any);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
    borderColor: borderColor.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={styles.pressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="search"
        accessibilityLabel="Search for services or workers"
        accessibilityHint="Tap to open search"
      >
        <Search size={18} color={colors.textMuted} style={styles.icon} />
        <Text style={styles.placeholder}>What do you need help with?</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: layout.primaryButtonH,
    backgroundColor: colors.bgInput,
    borderRadius: radius.pill,
    overflow: 'hidden', // Ensure border respects radius
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  icon: {
    marginRight: 10,
  },
  placeholder: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
