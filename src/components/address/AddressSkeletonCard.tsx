import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '../../design';

export const AddressSkeletonCard: React.FC = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <Animated.View style={[styles.iconCircle, animatedStyle]} />
        <View style={styles.textContainer}>
          <Animated.View style={[styles.titleLine, animatedStyle]} />
          <Animated.View style={[styles.streetLine, animatedStyle]} />
          <Animated.View style={[styles.cityLine, animatedStyle]} />
        </View>
        <Animated.View style={[styles.radioCircle, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.mintHaze,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleLine: {
    width: 110,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.mintHaze,
    marginBottom: 8,
  },
  streetLine: {
    width: '90%',
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.mintHaze,
    marginBottom: 6,
  },
  cityLine: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.mintHaze,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.mintHaze,
  },
});
