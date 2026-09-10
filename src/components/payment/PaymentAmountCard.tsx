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
      {/* Header Tag Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>AMOUNT DUE</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>All Taxes Included</Text>
        </View>
      </View>

      {/* Hero Amount Display */}
      <View style={styles.amountRow}>
        <Text style={styles.currencyText}>Rs.</Text>
        <Text style={styles.amountValue}>{total.toLocaleString()}</Text>
      </View>

      {/* Subtle Divider */}
      <View style={styles.divider} />

      {/* Escrow Protection Box */}
      <View style={styles.escrowContainer}>
        <View style={styles.escrowIconCircle}>
          <ShieldCheck size={18} color={colors.primaryDark} strokeWidth={2.4} />
        </View>
        <View style={styles.escrowTextCol}>
          <Text style={styles.escrowTitle}>TaskLync Escrow Protection</Text>
          <Text style={styles.escrowBody}>
            Payment is held securely in escrow and only released to the professional after you verify and approve the completed job.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.gray200,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLabel: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  badge: {
    backgroundColor: palette.gray100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 10,
    color: palette.gray600,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  currencyText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 20,
    color: colors.primaryDark,
    marginRight: 6,
  },
  amountValue: {
    fontFamily: fontFamily.inter.extraBold,
    fontSize: 36,
    lineHeight: 42,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray100,
    marginBottom: 14,
  },
  escrowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.green50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.green200,
    padding: 12,
    gap: 10,
  },
  escrowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  escrowTextCol: {
    flex: 1,
  },
  escrowTitle: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.primaryDark,
  },
  escrowBody: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 11,
    lineHeight: 16,
    color: palette.green900,
    marginTop: 2,
    opacity: 0.85,
  },
});
