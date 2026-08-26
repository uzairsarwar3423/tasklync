import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LanguageCode } from '../../types/settings.types';
import { colors, palette, fontFamily, radius } from '../../design';
import * as Haptics from 'expo-haptics';

export interface LanguageToggleProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
}

const TOGGLE_WIDTH = 140;
const TOGGLE_HEIGHT = 38;
const PADDING = 3;
const PILL_WIDTH = (TOGGLE_WIDTH - PADDING * 2) / 2; // 67px

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ value, onChange }) => {
  const isEnglish = value === 'en';
  const translateX = useSharedValue(isEnglish ? 0 : PILL_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(isEnglish ? 0 : PILL_WIDTH, {
      damping: 24,
      stiffness: 300,
      mass: 0.8,
    });
  }, [isEnglish, translateX]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSelect = (lang: LanguageCode) => {
    if (lang !== value) {
      Haptics.selectionAsync().catch(() => {});
      onChange(lang);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Select App Language"
    >
      {/* Animated Sliding Green Pill */}
      <Animated.View style={[styles.activePill, animatedPillStyle]} />

      {/* English Option */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.optionBtn}
        onPress={() => handleSelect('en')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isEnglish }}
        accessibilityLabel="English"
      >
        <Text
          style={[styles.optionText, isEnglish && styles.optionTextActive]}
          maxFontSizeMultiplier={1.2}
          numberOfLines={1}
        >
          English
        </Text>
      </TouchableOpacity>

      {/* Urdu Option */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.optionBtn}
        onPress={() => handleSelect('ur')}
        accessibilityRole="radio"
        accessibilityState={{ selected: !isEnglish }}
        accessibilityLabel="Urdu"
      >
        <Text
          style={[styles.optionText, !isEnglish && styles.optionTextActive]}
          maxFontSizeMultiplier={1.2}
          numberOfLines={1}
        >
          اردو
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.iceGray,
    borderRadius: radius.pill,
    padding: PADDING,
    position: 'relative',
    borderWidth: 1,
    borderColor: palette.softGray,
    overflow: 'hidden',
  },
  activePill: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    width: PILL_WIDTH,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
  },
  optionBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  optionTextActive: {
    fontFamily: fontFamily.jakarta.bold,
    color: colors.textOnGreen,
  },
});
