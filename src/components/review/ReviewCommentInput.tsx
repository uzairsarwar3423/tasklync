import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, palette, fontFamily, fontSize, radius, spacing } from '../../design';

const MAX_CHARACTERS = 500;
const WARNING_THRESHOLD = 450; // 90%

export interface ReviewCommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * ReviewCommentInput Component
 *
 * Isolated multiline comment box:
 * - Native maxLength={500} hard stop (Jakob's Law convention)
 * - Live character counter ("120 / 500") with subtle warning tone shift near 90%
 * - Android textAlignVertical: 'top' support
 * - Clean focus state indicator with theme tokens
 */
export const ReviewCommentInput: React.FC<ReviewCommentInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Share details about the work done, professionalism, or any tips for others (optional)...',
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value.length;
  const isNearLimit = charCount >= WARNING_THRESHOLD;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Detailed Feedback (Optional)</Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_CHARACTERS}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.textInput}
          textAlignVertical="top"
          accessibilityLabel="Review comments"
          accessibilityHint="Optional feedback up to 500 characters"
        />

        {/* Live Character Counter */}
        <View style={styles.counterRow}>
          <Text
            style={[
              styles.counterText,
              isNearLimit && styles.counterTextWarning,
            ]}
          >
            <Text style={styles.counterNumber}>{charCount}</Text>
            <Text style={styles.counterLimit}> / {MAX_CHARACTERS}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  label: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md - 2,
    minHeight: 124,
  },
  inputWrapperFocused: {
    borderColor: colors.primaryDark,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.bgSection,
    borderColor: colors.border,
  },
  textInput: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    color: colors.textPrimary,
    minHeight: 80,
    padding: 0,
    lineHeight: 20,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  counterText: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.dataXS + 0.5,
    color: colors.textMuted,
  },
  counterNumber: {
    fontFamily: fontFamily.inter.medium,
    color: colors.textSecondary,
  },
  counterLimit: {
    fontFamily: fontFamily.jakarta.regular,
    color: colors.textMuted,
  },
  counterTextWarning: {
    color: palette.warningDark,
  },
});
