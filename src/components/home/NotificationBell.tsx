import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconButton } from '../ui/Button/IconButton';
import { Text } from '../ui/Text/Text';
import { useNotificationStore } from '../../store/notification.store';
import { colors, palette } from '../../design/colors';
import { fontFamily } from '../../design/typography';

interface NotificationBellProps {
  unreadCount?: number;
  onPress?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount: propUnreadCount,
  onPress,
}) => {
  const router = useRouter();
  const storeUnreadCount = useNotificationStore((s) => s.unreadCount);
  const effectiveUnreadCount = propUnreadCount !== undefined ? propUnreadCount : storeUnreadCount;

  const rotation = useSharedValue(0);
  const badgeScale = useSharedValue(effectiveUnreadCount > 0 ? 1 : 0);

  useEffect(() => {
    if (effectiveUnreadCount > 0) {
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
  }, [effectiveUnreadCount, badgeScale, rotation]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onPress) {
      onPress();
    } else {
      router.push('/notifications' as any);
    }
  };

  const displayCount = effectiveUnreadCount > 99 ? '99+' : effectiveUnreadCount.toString();

  return (
    <View>
      <Animated.View style={bellStyle}>
        <IconButton
          icon={Bell}
          iconSize={22}
          color={colors.textPrimary}
          bg="transparent"
          bgPressed="rgba(0,0,0,0.05)"
          onPress={handlePress}
          size={40}
          accessibilityLabel={`Notifications, ${effectiveUnreadCount} unread`}
        />
      </Animated.View>

      {effectiveUnreadCount > 0 && (
        <Animated.View style={[styles.badge, badgeStyle]} pointerEvents="none">
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
