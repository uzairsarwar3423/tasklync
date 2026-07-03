import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { IconButton } from '../ui/Button/IconButton';
import { Text } from '../ui/Text/Text';
import { colors, palette } from '../../design/colors';
import { fontFamily } from '../../design/typography';

interface NotificationBellProps {
  unreadCount?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount = 0 }) => {
  const rotation = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (unreadCount > 0) {
      // Badge appearance animation
      badgeScale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1.0, { damping: 12, stiffness: 100 })
      );

      // Bell ring animation
      rotation.value = withSequence(
        withTiming(15, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withRepeat(
          withTiming(-15, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          3,
          true
        ),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) })
      );
    } else {
      badgeScale.value = withTiming(0, { duration: 150 });
    }
  }, [unreadCount]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <View>
      <Animated.View style={bellStyle}>
        <IconButton
          icon={Bell}
          iconSize={22}
          color={colors.textPrimary}
          bg="transparent"
          bgPressed="rgba(0,0,0,0.05)"
          onPress={() => {}}
          size={40}
          accessibilityLabel="Notifications"
        />
      </Animated.View>
      
      {unreadCount > 0 && (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{displayCount}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: palette.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    borderWidth: 2,
    borderColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 9,
    color: colors.bgCard,
    lineHeight: 11,
  },
});
