import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from '../ui/Text/Text';
import { NotificationBell } from './NotificationBell';
import { useAuthStore } from '../../store/auth.store';
import { useLocation } from '../../hooks/useLocation';
import { SkeletonHomeHeader } from '../ui/Skeleton';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { fontFamily } from '../../design/typography';

export const HomeHeader = () => {
  const user = useAuthStore((state) => state.user);
  const { cityName, isLocating } = useLocation();
  const pillScale = useSharedValue(1);

  // Time-based greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Good morning, ';
    if (hour >= 12 && hour < 18) return 'Good afternoon, ';
    if (hour >= 18 && hour < 23) return 'Good evening, ';
    return 'Good night, ';
  };

  const handlePillPressIn = () => {
    pillScale.value = withSpring(0.97, { stiffness: 400, damping: 20 });
  };

  const handlePillPressOut = () => {
    pillScale.value = withSpring(1);
  };

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.value }],
  }));

  if (isLocating) {
    return <SkeletonHomeHeader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <Animated.View style={pillAnimatedStyle}>
          <Pressable 
            style={styles.locationPill}
            onPressIn={handlePillPressIn}
            onPressOut={handlePillPressOut}
          >
            <MapPin size={14} color={colors.primary} />
            <Text style={styles.cityText}>{cityName}</Text>
            <ChevronDown size={12} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
        
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>
            {getGreeting()}
            <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.rightSide}>
        <NotificationBell />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  leftSide: {
    flex: 1,
  },
  locationPill: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.pill,
    height: 28,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  greetingRow: {
    marginTop: 8,
  },
  greetingText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  nameText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  rightSide: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 50,
  },
});
