import { BookingStatus } from '../types/booking.types';

/**
 * Single source of truth for booking status styling & labels (Day 38)
 */

export function statusToColor(status?: BookingStatus | string): string {
  switch (status) {
    case 'PENDING':
      return '#F59E0B'; // Amber
    case 'ACCEPTED':
      return '#2563EB'; // Blue
    case 'IN_PROGRESS':
    case 'COMPLETED_BY_WORKER':
    case 'RESOLVED':
      return '#16A34A'; // Green
    case 'COMPLETED':
    case 'AUTO_COMPLETED':
      return '#64748B'; // Slate Gray
    case 'CANCELLED':
    case 'REJECTED':
      return '#EF4444'; // Red
    case 'DISPUTED':
      return '#DC2626'; // Deep Red
    case 'REFUNDED':
      return '#0284C7'; // Sky Blue
    default:
      return '#94A3B8'; // Neutral Slate
  }
}

export function statusToBgColor(status?: BookingStatus | string): string {
  switch (status) {
    case 'PENDING':
      return '#FEF3C7'; // Amber 100
    case 'ACCEPTED':
      return '#DBEAFE'; // Blue 100
    case 'IN_PROGRESS':
    case 'COMPLETED_BY_WORKER':
    case 'RESOLVED':
      return '#DCFCE7'; // Green 100
    case 'COMPLETED':
    case 'AUTO_COMPLETED':
      return '#F1F5F9'; // Slate 100
    case 'CANCELLED':
    case 'REJECTED':
      return '#FEE2E2'; // Red 100
    case 'DISPUTED':
      return '#FFE4E6'; // Rose 100
    case 'REFUNDED':
      return '#E0F2FE'; // Sky 100
    default:
      return '#F1F5F9';
  }
}

export function statusToLabel(status?: BookingStatus | string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ACCEPTED':
      return 'Confirmed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED_BY_WORKER':
      return 'Awaiting Confirmation';
    case 'COMPLETED':
    case 'AUTO_COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REJECTED':
      return 'Declined';
    case 'DISPUTED':
      return 'Disputed';
    case 'RESOLVED':
      return 'Resolved';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return status ? String(status).replace(/_/g, ' ') : 'Unknown';
  }
}
