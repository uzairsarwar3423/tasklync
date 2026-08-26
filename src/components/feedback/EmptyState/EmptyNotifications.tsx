import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BellRing, Sparkles } from 'lucide-react-native';

export interface EmptyNotificationsProps {
  isFiltered?: boolean;
}

/**
 * EmptyNotifications Component
 *
 * Implements Peak-End Rule payoff design:
 * - Shown only when notifications query resolves with 0 items.
 * - Celebratory and calming visual reassurance: "You're all caught up! 🎉"
 * - No forced or irrelevant CTA button (per design spec constraint).
 * - Smooth entrance motion with spring physics.
 */
export const EmptyNotifications: React.FC<EmptyNotificationsProps> = ({
  isFiltered = false,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 240 });
    scale.value = withSpring(1, { damping: 16, stiffness: 180 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Icon with celebratory ambient badge */}
      <View style={styles.iconContainer}>
        <View style={styles.outerGlow}>
          <View style={styles.innerCircle}>
            <BellRing size={36} color="#16A34A" strokeWidth={2} />
          </View>
        </View>
        <View style={styles.sparkleBadge}>
          <Sparkles size={14} color="#EAB308" strokeWidth={2.4} />
        </View>
      </View>

      {/* Headlines */}
      <Text style={styles.title}>
        {isFiltered ? 'No unread notifications' : "You're all caught up! 🎉"}
      </Text>

      <Text style={styles.description}>
        {isFiltered
          ? 'You have reviewed all your updates. Switch back to "All" to view previous notifications.'
          : 'When you get updates on your bookings, direct messages, or exclusive offers, they will appear here in real-time.'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  outerGlow: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CA8A04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
});
