import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WalletCards, Plus } from 'lucide-react-native';
import { colors, palette, fontFamily, fontSize, radius, spacing } from '../../design';

export interface PaymentEmptyStateProps {
  onAddPress: () => void;
}

export const PaymentEmptyState: React.FC<PaymentEmptyStateProps> = ({ onAddPress }) => {
  const handlePress = () => {
    onAddPress();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <WalletCards size={36} color={colors.primary} />
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={1.3}>
        No payment methods yet
      </Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>
        Add your JazzCash, EasyPaisa wallet or Debit/Credit card to book and pay for home services with 1-tap ease.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Add your first payment method"
      >
        <Plus size={18} color={colors.textOnGreen} strokeWidth={2.5} />
        <Text style={styles.buttonText} maxFontSizeMultiplier={1.2}>
          Add Payment Method
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.green200,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs + 2,
  },
  buttonText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body2 + 1,
    color: colors.textOnGreen,
  },
});
