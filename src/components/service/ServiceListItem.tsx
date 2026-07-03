import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Zap, Wind, Droplet, Sparkles, Wrench } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';
import { springConfig } from '../../design/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceListItemProps {
  id: string;
  name: string;
  categoryName: string;
  duration: string;
  startingPrice: number;
  currency: string;
  iconName?: string;
}

export const ServiceListItem: React.FC<ServiceListItemProps> = ({
  id,
  name,
  categoryName,
  duration,
  startingPrice,
  currency,
  iconName,
}) => {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springConfig.stiff);
    pressed.value = 1;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, springConfig.bouncy);
    pressed.value = 0;
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/service/${id}` as any);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [colors.bgCard, colors.bgSection]
    );
    
    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      shadowOpacity: scale.value < 1 ? 0 : ((shadows.sm as any).shadowOpacity || 0.08),
      elevation: scale.value < 1 ? 0 : ((shadows.sm as any).elevation || 2),
    };
  });

  const getIcon = () => {
    switch (iconName) {
      case 'zap': return <Zap size={24} color={colors.primary} />;
      case 'wind': return <Wind size={24} color={colors.primary} />;
      case 'droplet': return <Droplet size={24} color={colors.primary} />;
      case 'sparkles': return <Sparkles size={24} color={colors.primary} />;
      default: return <Wrench size={24} color={colors.primary} />;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.iconArea}>
        {getIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.categoryRow} numberOfLines={1}>
          {categoryName}
        </Text>
        <Text style={styles.duration} numberOfLines={1}>
          {duration}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>From </Text>
        <Text style={styles.priceValue}>{currency} {startingPrice}</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%', // Scalable 2-column width
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
    ...shadows.sm,
    flexDirection: 'column',
  },
  iconArea: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  name: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
    minHeight: 40, // Keeps grid cells structurally equal if text wraps
  },
  categoryRow: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  duration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  priceValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
});
