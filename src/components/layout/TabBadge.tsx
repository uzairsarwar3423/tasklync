import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { fontFamily } from '../../design/typography';

interface TabBadgeProps {
  count: number;
}

export const TabBadge = ({ count }: TabBadgeProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 260 }),
        withSpring(1.0, { damping: 14, stiffness: 200 })
      );
    }
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : `${count}`;

  return (
    <Animated.View style={[styles.badge, animatedStyle]} pointerEvents="none">
      <Text style={styles.badgeText} numberOfLines={1}>
        {displayCount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444', // Premium notification badge red
    borderWidth: 1.5,
    borderColor: '#FFFFFF', // Crisp cutout against tab background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
