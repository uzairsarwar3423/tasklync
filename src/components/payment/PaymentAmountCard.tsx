import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { colors, palette, fontFamily } from '../../design';

export interface PaymentAmountCardProps {
  total: number;
}

export const PaymentAmountCard: React.FC<PaymentAmountCardProps> = ({ total }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.headerLabel}>AMOUNT DUE</Text>

      <View style={styles.amountRow}>
        <Text style={styles.currencyText}>Rs.</Text>
        <Text style={styles.amountValue}>{total.toLocaleString()}</Text>
      </View>

      <View style={styles.escrowRow}>
        <ShieldCheck size={16} color={colors.primaryDark} strokeWidth={2.2} />
        <Text style={styles.escrowText}>
          Payment held in escrow • Released after job completion
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  headerLabel: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  currencyText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 18,
    color: colors.primaryDark,
    marginRight: 6,
  },
  amountValue: {
    fontFamily: fontFamily.inter.extraBold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textPrimary,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.green50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 6,
    gap: 6,
  },
  escrowText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 11,
    color: colors.primaryDark,
  },
});
