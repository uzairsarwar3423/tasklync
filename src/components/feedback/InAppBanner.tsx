import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  MessageSquare,
  CalendarCheck,
  CreditCard,
  Star,
  Sparkles,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface InAppBannerData {
  id: string;
  title: string;
  body: string;
  category?: string | undefined;
  deepLink?: string | undefined;
  data?: Record<string, any> | undefined;
}

interface InAppBannerProps {
  data: InAppBannerData;
  onPress: (data: InAppBannerData) => void;
  onDismiss: () => void;
  duration?: number;
}

/**
 * InAppBanner Component
 *
 * Implements Day 31 In-App Notification UI Standards:
 * - Reanimated 3 Spring Entrance (translateY -100 -> 0, scale 0.95 -> 1.0)
 * - Gesture-enabled Pan Gesture (swipe up to dismiss immediately)
 * - High visual hierarchy with category-specific badge icons & brand accents
 * - Fitts's Law generous touch area (full width card)
 * - Safe area aware (sits cleanly beneath status bar)
 */
export const InAppBanner = React.memo(function InAppBanner({
  data,
  onPress,
  onDismiss,
  duration = 4000,
}: InAppBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance Animation
    translateY.value = withSpring(0, { damping: 18, stiffness: 220, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 180 });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      handleExit();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleExit = () => {
    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(-120, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    handleExit();
    onPress(data);
  };

  // Pan gesture to allow swiping up to dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -30 || event.velocityY < -400) {
        runOnJS(handleExit)();
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getCategoryIcon = () => {
    const cat = (data.category || '').toLowerCase();
    if (cat.includes('chat') || cat.includes('message')) {
      return <MessageSquare size={18} color="#2563EB" strokeWidth={2.2} />;
    }
    if (cat.includes('booking')) {
      return <CalendarCheck size={18} color="#16A34A" strokeWidth={2.2} />;
    }
    if (cat.includes('payment')) {
      return <CreditCard size={18} color="#D97706" strokeWidth={2.2} />;
    }
    if (cat.includes('review')) {
      return <Star size={18} color="#EAB308" strokeWidth={2.2} />;
    }
    if (cat.includes('marketing') || cat.includes('promo')) {
      return <Sparkles size={18} color="#9333EA" strokeWidth={2.2} />;
    }
    return <Bell size={18} color="#16A34A" strokeWidth={2.2} />;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          { top: Math.max(insets.top, Platform.OS === 'android' ? 12 : 16) },
          animatedStyle,
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`Notification: ${data.title}, ${data.body}`}
        >
          {/* Icon Badge */}
          <View style={styles.iconContainer}>{getCategoryIcon()}</View>

          {/* Text Details */}
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {data.title}
              </Text>
              <Text style={styles.timeBadge}>Just now</Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {data.body}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
