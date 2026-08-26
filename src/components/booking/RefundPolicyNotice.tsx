import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react-native';
import { RefundPolicyResult } from '../../types/booking.types';
import { colors, palette, fontFamily, fontSize, radius, spacing } from '../../design';

export interface RefundPolicyNoticeProps {
  policy: RefundPolicyResult;
  currency?: string;
}

/**
 * RefundPolicyNotice Component
 *
 * Implements Hard Problem #2:
 * - Dynamic plain-language refund summary computed by pure policy rules
 * - Explicit breakdown of refunded vs retained amounts
 * - Reusable across cancellation modals and dispute expectations
 */
export const RefundPolicyNotice: React.FC<RefundPolicyNoticeProps> = ({
  policy,
  currency = 'PKR',
}) => {
  const isFullRefund = policy.percentage === 100;
  const isPartialRefund = policy.percentage > 0 && policy.percentage < 100;
  const isNoRefund = policy.percentage === 0;

  return (
    <View
      style={[
        styles.container,
        isFullRefund && styles.containerFull,
        isPartialRefund && styles.containerPartial,
        isNoRefund && styles.containerNoRefund,
      ]}
      accessibilityRole="summary"
    >
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          {isFullRefund ? (
            <ShieldCheck size={20} color={colors.primaryDark} />
          ) : isPartialRefund ? (
            <Info size={20} color={palette.warningDark} />
          ) : (
            <AlertCircle size={20} color={colors.textDanger} />
          )}
        </View>

        <View style={styles.textCol}>
          <Text style={styles.headline}>{policy.headline}</Text>
          <Text style={styles.labelBadge}>{policy.label}</Text>
        </View>
      </View>

      <Text style={styles.reasonText}>{policy.reason}</Text>

      {policy.estimatedRefundAmount !== undefined && policy.estimatedRefundAmount > 0 ? (
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Estimated Refund Amount:</Text>
          <Text style={styles.amountValue}>
            {currency} {policy.estimatedRefundAmount.toLocaleString()}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  containerFull: {
    backgroundColor: palette.green50,
    borderColor: palette.green200,
  },
  containerPartial: {
    backgroundColor: palette.warningLight,
    borderColor: palette.warning,
  },
  containerNoRefund: {
    backgroundColor: palette.dangerLight,
    borderColor: '#FECACA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconCircle: {
    marginRight: spacing.sm + 2,
  },
  textCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headline: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body2 + 0.5,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  labelBadge: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.nano + 1,
    color: colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  reasonText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.dataXS,
    color: colors.textSecondary,
  },
  amountValue: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.dataSM + 1,
    color: colors.primaryDark,
  },
});
