import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';

export function useBookingDetails(bookingId: string | null | undefined) {
  const query = useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return await bookingApi.getBookingDetails(bookingId);
    },
    enabled: Boolean(bookingId),
    staleTime: 10_000,
    retry: false,
  });

  return {
    booking: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
