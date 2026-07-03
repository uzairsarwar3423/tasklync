import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Text } from '../ui/Text/Text';
import { Category } from '../../types/category.types';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';
import { fontFamily } from '../../design/typography';

interface ServiceCategoryCardProps {
  category: Category;
  index: number;
}

const CATEGORY_STYLES: Record<string, { bg: string; iconSource: any }> = {
  electrician: { bg: '#FEF3C7', iconSource: require('../../../assets/icons/categories/electrician.svg') },
  plumber: { bg: '#EFF6FF', iconSource: require('../../../assets/icons/categories/plumber.svg') },
  ac_repair: { bg: '#F0F9FF', iconSource: require('../../../assets/icons/categories/air-conditioner.svg') },
  cleaning: { bg: '#F0FDF4', iconSource: require('../../../assets/icons/categories/cleaning.svg') },
  carpenter: { bg: '#FFF7ED', iconSource: require('../../../assets/icons/categories/carpenter.svg') },
  painter: { bg: '#FDF4FF', iconSource: require('../../../assets/icons/categories/painter.svg') },
};

const DEFAULT_STYLE = { bg: colors.bgInput, iconSource: require('../../../assets/icons/categories/cleaning.svg') };

export const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({ category, index }) => {
  const router = useRouter();
  const scale = useSharedValue(0.93);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const shadowOpacity = useSharedValue(0.05); // Match shadows.sm

  useEffect(() => {
    // Entrance stagger animation
    const delay = index * 50;
    
    scale.value = withDelay(delay, withSpring(1));
    opacity.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withSpring(0));
  }, [index]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { stiffness: 400, damping: 20 });
    shadowOpacity.value = withSpring(0);
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.02, { stiffness: 200, damping: 10 }),
      withSpring(1)
    );
    shadowOpacity.value = withSpring(0.05);
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(('/category/' + category.id) as any);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
    shadowOpacity: shadowOpacity.value,
  }));

  const styleConfig = CATEGORY_STYLES[category.id] || DEFAULT_STYLE;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={styles.pressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${category.name} services`}
        accessibilityHint={`Tap to browse ${category.name} workers`}
      >
        <View style={[styles.iconArea, { backgroundColor: styleConfig.bg }]}>
          <Image 
            source={styleConfig.iconSource} 
            style={{ width: 28, height: 28 }} 
            contentFit="contain" 
          />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {category.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 106,
    height: 100,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  pressable: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconArea: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
});
