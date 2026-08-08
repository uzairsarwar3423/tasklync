import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      return await bookingApi.cancelBooking(bookingId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking-track', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['active-booking'] });
    },
  });

  return {
    cancelBooking: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
}
