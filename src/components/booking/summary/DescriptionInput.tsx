import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, palette, fontFamily } from '../../../design';

export interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const DescriptionInput: React.FC<DescriptionInputProps> = ({
  value,
  onChangeText,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(Boolean(value));
  const heightProgress = useSharedValue(value ? 1 : 0);

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    heightProgress.value = withSpring(nextState ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  };

  const animatedInputStyle = useAnimatedStyle(() => ({
    maxHeight: heightProgress.value * 120,
    opacity: heightProgress.value,
    marginTop: heightProgress.value * 10,
  }));

  return (
    <View style={styles.card}>
      <Pressable onPress={toggleExpand} style={styles.headerRow}>
        <View style={styles.leftGroup}>
          <MessageSquare size={16} color={colors.primaryDark} strokeWidth={2.2} />
          <Text style={styles.headerTitle}>Special Instructions for Provider</Text>
        </View>

        {isExpanded ? (
          <ChevronUp size={18} color={colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={colors.textMuted} />
        )}
      </Pressable>

      {isExpanded && (
        <Animated.View style={[styles.inputWrapper, animatedInputStyle]}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder="e.g. Please bring extra extension cord, ring doorbell twice..."
            placeholderTextColor={palette.gray400}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={250}
          />
          <Text style={styles.charCount}>{value.length}/250</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  inputWrapper: {
    overflow: 'hidden',
  },
  textInput: {
    backgroundColor: palette.iceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.softGray,
    padding: 12,
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
    minHeight: 70,
  },
  charCount: {
    fontFamily: fontFamily.inter.regular,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
});
