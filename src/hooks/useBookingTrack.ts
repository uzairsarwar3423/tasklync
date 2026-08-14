import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';

export function useBookingTrack(bookingId: string | null | undefined, _enabled = false) {
  const query = useQuery({
    queryKey: ['booking-track', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return await bookingApi.trackBooking(bookingId);
    },
    // Temporarily disabled remote polling on /track to prevent 429 Too Many Requests
    enabled: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: false,
  });

  return {
    trackData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
