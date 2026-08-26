import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, palette, fontFamily, radius, fontSize } from '../../design';

export interface AddressNotesInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const AddressNotesInput: React.FC<AddressNotesInputProps> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label} maxFontSizeMultiplier={1.3}>
          Delivery & Entry Notes
        </Text>
        <Text style={styles.optionalText} maxFontSizeMultiplier={1.3}>
          Optional
        </Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="e.g. Flat 3B, blue gate, near the mosque"
        placeholderTextColor={palette.gray400}
        maxLength={120}
        multiline={false}
        returnKeyType="done"
        maxFontSizeMultiplier={1.3}
        accessibilityLabel="Delivery and entry notes"
        accessibilityHint="Optional specific details to help the worker find your door"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  optionalText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  input: {
    height: 48,
    backgroundColor: palette.iceGray,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
});
