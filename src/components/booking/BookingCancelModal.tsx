import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import { BookingDetails } from '../../types/booking.types';
import { useCancelBooking } from '../../hooks/useCancelBooking';
import { RefundPolicyNotice } from './RefundPolicyNotice';
import { colors, palette, fontFamily, fontSize, radius, spacing } from '../../design';
import * as Haptics from 'expo-haptics';

export interface BookingCancelModalProps {
  visible: boolean;
  booking: BookingDetails;
  onClose: () => void;
  onCancelled?: () => void;
}

const COMMON_CANCEL_REASONS = [
  'Change of plans / No longer needed',
  'Found alternative service',
  'Scheduled by mistake',
  'Professional delayed / Rescheduled',
  'Other reasons',
];

/**
 * BookingCancelModal Component
 *
 * Implements Fitts's Law & Calibrated Friction:
 * - Equal-size 52px stacked buttons (Keep Booking vs Cancel Booking)
 * - Single confirmation depth with dynamically calculated refund consequence
 * - Preserves calm, non-manipulative decision making
 */
export const BookingCancelModal: React.FC<BookingCancelModalProps> = ({
  visible,
  booking,
  onClose,
  onCancelled,
}) => {
  const { cancelBooking, isLoading, error, refundPolicy } = useCancelBooking(booking);
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirmCancel = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const finalReason = selectedReason === 'Other reasons' && customReason.trim()
        ? customReason.trim()
        : selectedReason;

      await cancelBooking({
        bookingId: booking.id,
        reason: finalReason,
      });

      onClose();
      if (onCancelled) {
        onCancelled();
      }
    } catch (_err) {
      // Error is captured in hook
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.warningIconCircle}>
                <AlertTriangle size={20} color={colors.textDanger} />
              </View>
              <Text style={styles.title}>Cancel Booking?</Text>
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isLoading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Booking Summary Note */}
            <Text style={styles.jobSummary}>
              {booking.category_name || 'Home Service'} · Scheduled for{' '}
              {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : 'Upcoming'}
            </Text>

            {/* Computed Dynamic Refund Policy Notice */}
            <RefundPolicyNotice
              policy={refundPolicy}
              currency={booking.currency || 'PKR'}
            />

            {/* Cancellation Reason Selector */}
            <Text style={styles.reasonHeading}>Reason for cancellation:</Text>
            <View style={styles.reasonsList}>
              {COMMON_CANCEL_REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <Pressable
                    key={r}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    onPress={() => setSelectedReason(r)}
                    disabled={isLoading}
                  >
                    <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedReason === 'Other reasons' && (
              <TextInput
                style={styles.customInput}
                placeholder="Please describe why you are cancelling..."
                placeholderTextColor={colors.textMuted}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                maxLength={200}
                editable={!isLoading}
              />
            )}

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Equal-Sized 52px Action Buttons (Fitts's Law) */}
          <View style={styles.footer}>
            {/* Destructive Confirm Button */}
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.cancelConfirmBtn,
                isLoading && styles.btnLoading,
                pressed && !isLoading && styles.btnPressed,
              ]}
              onPress={handleConfirmCancel}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Confirm Booking Cancellation"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={palette.white} />
              ) : (
                <Text style={styles.cancelConfirmText}>Cancel Booking</Text>
              )}
            </Pressable>

            {/* Safe Keep Booking Button */}
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.keepBtn,
                pressed && !isLoading && styles.keepBtnPressed,
              ]}
              onPress={onClose}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Keep this booking"
            >
              <Text style={styles.keepBtnText}>Keep Booking</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h4 + 1,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    marginVertical: spacing.xs,
  },
  jobSummary: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  reasonHeading: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.label,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  reasonsList: {
    gap: 6,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: palette.gray50,
  },
  reasonOptionSelected: {
    backgroundColor: palette.green50,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    marginRight: spacing.sm,
  },
  radioDotSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryDark,
  },
  reasonText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2 - 0.5,
    color: colors.textSecondary,
    flex: 1,
  },
  reasonTextSelected: {
    fontFamily: fontFamily.jakarta.medium,
    color: colors.textPrimary,
  },
  customInput: {
    backgroundColor: palette.gray50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    minHeight: 64,
    marginTop: spacing.sm,
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  errorBanner: {
    backgroundColor: palette.dangerLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.caption,
    color: colors.textDanger,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    height: 52, // Fitts's Law: Exactly 52px for both options
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmBtn: {
    backgroundColor: colors.textDanger,
    shadowColor: colors.textDanger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnLoading: {
    opacity: 0.8,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cancelConfirmText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1 - 0.5,
    color: palette.white,
  },
  keepBtn: {
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keepBtnPressed: {
    backgroundColor: palette.gray200,
    transform: [{ scale: 0.99 }],
  },
  keepBtnText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.body1 - 0.5,
    color: colors.textPrimary,
  },
});
