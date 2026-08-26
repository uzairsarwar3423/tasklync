import { BookingDetails, RefundPolicyResult } from '../types/booking.types';

/**
 * Pure function: Computes the refund policy according to Tasklync Payment & Cancellation Architecture.
 *
 * Policy Matrix:
 * 1. PENDING (before worker accepts): 100% refund, no platform fees.
 * 2. ACCEPTED and >24 hours before scheduled appointment: 90% refund (10% platform processing fee).
 * 3. ACCEPTED and <=24 hours before appointment: 50% refund (50% fee to compensate reserved worker time).
 * 4. IN_PROGRESS / COMPLETED / COMPLETED_BY_WORKER: 0% standard refund (Dispute-only path).
 * 5. CANCELLED / REFUNDED: Already terminated.
 */
export function computeRefundPolicy(
  booking?: Partial<BookingDetails> | null,
  referenceNow: Date = new Date()
): RefundPolicyResult {
  if (!booking) {
    return {
      percentage: 100,
      label: 'Full Refund (100%)',
      headline: "You'll receive a full 100% refund",
      reason: 'No cancellation penalty applies.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: 0,
    };
  }

  const status = (booking.status || 'PENDING').toUpperCase();
  const totalAmount = Number(booking.estimated_total || booking.base_price || 0);

  // 1. Before worker accepts
  if (status === 'PENDING') {
    return {
      percentage: 100,
      label: 'Full Refund (100%)',
      headline: "You'll receive a 100% full refund",
      reason: 'The service professional has not yet accepted this booking. Zero cancellation fees apply.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: totalAmount,
    };
  }

  // 2. Active ongoing or completed work (Dispute-only)
  if (
    status === 'IN_PROGRESS' ||
    status === 'COMPLETED' ||
    status === 'COMPLETED_BY_WORKER' ||
    status === 'AUTO_COMPLETED' ||
    status === 'DISPUTED'
  ) {
    return {
      percentage: 0,
      label: 'No Standard Refund (0%)',
      headline: 'Job is active or completed',
      reason: 'Standard cancellation is unavailable once a job has commenced. If you experienced poor service, an overcharge, or an incomplete job, please raise a dispute.',
      eligibleForRefund: false,
      isDisputeOnly: true,
      estimatedRefundAmount: 0,
    };
  }

  // 3. Already cancelled / refunded
  if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'REJECTED') {
    return {
      percentage: 0,
      label: 'Booking Closed',
      headline: 'Booking is already cancelled or closed',
      reason: 'No further cancellation actions can be applied to this booking.',
      eligibleForRefund: false,
      isDisputeOnly: false,
      estimatedRefundAmount: 0,
    };
  }

  // 4. ACCEPTED status: compute timing window
  const scheduledTimeStr = booking.scheduled_at;
  if (!scheduledTimeStr) {
    // Default safe fallback if no scheduled timestamp is parseable
    const refundAmount = Math.round((totalAmount * 90) / 100);
    return {
      percentage: 90,
      label: '90% Refund',
      headline: "You'll receive a 90% refund",
      reason: 'Standard cancellation after worker confirmation. 10% platform fee deducted.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: refundAmount,
    };
  }

  const scheduledDate = new Date(scheduledTimeStr);
  const nowTime = referenceNow.getTime();
  const scheduledTime = scheduledDate.getTime();
  const diffHours = (scheduledTime - nowTime) / (1000 * 60 * 60);

  if (diffHours > 24) {
    // More than 24 hours prior to appointment
    const refundAmount = Math.round((totalAmount * 90) / 100);
    return {
      percentage: 90,
      label: '90% Refund',
      headline: "You'll receive a 90% refund",
      reason: 'Cancelled more than 24 hours prior to appointment time. A 10% platform booking fee is deducted.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: refundAmount,
    };
  } else if (diffHours > 0) {
    // Within 24 hours of appointment
    const refundAmount = Math.round((totalAmount * 50) / 100);
    return {
      percentage: 50,
      label: '50% Refund',
      headline: "You'll receive a 50% refund",
      reason: 'Cancelled within 24 hours of scheduled time. 50% is retained to compensate the professional for reserved time.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: refundAmount,
    };
  } else {
    // Past scheduled time but not marked in progress yet
    const refundAmount = Math.round((totalAmount * 50) / 100);
    return {
      percentage: 50,
      label: '50% Refund',
      headline: "You'll receive a 50% refund",
      reason: 'Cancelled past scheduled start time. 50% compensation applies.',
      eligibleForRefund: true,
      isDisputeOnly: false,
      estimatedRefundAmount: refundAmount,
    };
  }
}
