import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadows } from '../../design';
import * as Haptics from 'expo-haptics';

export interface AddCardButtonProps {
  onPress: () => void;
  label?: string;
}

export const AddCardButton: React.FC<AddCardButtonProps> = ({
  onPress,
  label = '+ Add New Payment Method',
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Plus size={18} color={colors.textOnGreen} strokeWidth={2.5} />
      <Text style={styles.buttonText} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs + 2,
    ...shadows.sm,
  },
  buttonText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1,
    color: colors.textOnGreen,
  },
});
