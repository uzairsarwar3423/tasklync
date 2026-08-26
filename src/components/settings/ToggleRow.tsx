import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { colors, palette, fontFamily, spacing } from '../../design';

export interface ToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) => {
  const accessibilityState = { checked: value, disabled };
  const a11yAnnouncement = `${label}, ${subtitle ? subtitle + ', ' : ''}${value ? 'on' : 'off'}`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="switch"
      accessibilityState={accessibilityState}
      accessibilityLabel={a11yAnnouncement}
    >
      <View style={styles.textContainer}>
        <Text
          style={styles.label}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={styles.subtitle}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: palette.gray300,
          true: palette.green300,
        }}
        thumbColor={value ? colors.primaryDark : palette.white}
        ios_backgroundColor={palette.gray200}
        style={Platform.OS === 'ios' ? styles.iosSwitch : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 2,
  },
  iosSwitch: {
    transform: [{ scaleX: 0.88 }, { scaleY: 0.88 }],
  },
});
