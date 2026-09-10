import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';
import { BookingDetails, CancelBookingData } from '../types/booking.types';
import { computeRefundPolicy } from '../utils/refundPolicy';

export function useCancelBooking(booking?: Partial<BookingDetails> | null) {
  const queryClient = useQueryClient();

  const refundPolicy = useMemo(() => {
    return computeRefundPolicy(booking);
  }, [booking]);

  const mutation = useMutation<CancelBookingData, Error, { bookingId: string; reason: string }>({
    mutationFn: async ({ bookingId, reason }) => {
      return await bookingApi.cancelBooking(bookingId, reason);
    },
    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking-track', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['active-booking'] });
    },
  });

  return {
    cancelBooking: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ? (mutation.error as Error).message : null,
    refundPolicy,
  };
}
