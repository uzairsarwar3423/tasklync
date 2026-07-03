import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Dimensions, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Home, Search, Calendar, User, CalendarCheck, UserCheck } from 'lucide-react-native';
import { colors } from '../../design/colors';
import { fontFamily } from '../../design/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Spring configuration for fluid microinteractions
const SPRING_CONFIG = {
  damping: 16,
  stiffness: 120,
  mass: 0.8,
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 40);
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, SPRING_CONFIG);
  }, [state.index]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth / state.routes.length;

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: tabWidth - 16,
      transform: [
        { translateX: activeIndex.value * tabWidth + 8 }
      ],
    };
  });

  // Calculate bottom position based on safe area (handles iOS Home Indicator & Android gesture nav)
  const bottomPosition = insets.bottom > 0 ? insets.bottom + 12 : 24;

  return (
    <View style={[styles.wrapper, { bottom: bottomPosition }]}>
      <View style={styles.container} onLayout={onLayout}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Haptic feedback for physical engagement
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          const renderIcon = (color: string) => {
            const iconProps = { size: 22, color, strokeWidth: isFocused ? 2.5 : 2 };

            switch (route.name) {
              case 'index':
                return isFocused ? <Home {...iconProps} /> : <Home {...iconProps} />;
              case 'explore':
                return <Search {...iconProps} />;
              case 'bookings':
                return isFocused ? <CalendarCheck {...iconProps} /> : <Calendar {...iconProps} />;
              case 'profile':
                return isFocused ? <UserCheck {...iconProps} /> : <User {...iconProps} />;
              default:
                return <Home {...iconProps} />;
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tab}
            >
              <TabIcon isFocused={isFocused} label={options.title || route.name}>
                {renderIcon}
              </TabIcon>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const TabIcon = ({ isFocused, label, children }: any) => {
  const scale = useSharedValue(isFocused ? 1 : 1);
  const translateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    if (isFocused) {
      // Bouncy entrance for the active icon
      scale.value = withSequence(
        withSpring(0.85, { damping: 15, stiffness: 300 }),
        withSpring(1.15, { damping: 10, stiffness: 200 }),
        withSpring(1, SPRING_CONFIG)
      );
      translateY.value = withSpring(-3, SPRING_CONFIG);
    } else {
      scale.value = withSpring(1, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
    }
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.6, { duration: 200 }),
      transform: [
        { scale: withTiming(isFocused ? 1 : 0.95, { duration: 200 }) },
      ]
    };
  });

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={iconStyle}>
        {children(isFocused ? colors.primaryDark : colors.textMuted)}
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: isFocused ? colors.primaryDark : colors.textMuted },
          textStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    height: 68,
    backgroundColor: colors.bgCard,
    borderRadius: 34, // Fully rounded floating pill
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    height: 56, // 68 - 12 (6 top + 6 bottom)
    backgroundColor: colors.primaryTint,
    borderRadius: 28,
  },
});
