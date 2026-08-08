import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';

export function useConfirmCompletion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return await bookingApi.confirmCompletion(bookingId);
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking-track', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['active-booking'] });
    },
  });

  return {
    confirmCompletion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
}
