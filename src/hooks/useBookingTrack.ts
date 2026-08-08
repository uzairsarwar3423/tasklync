import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';

export function useBookingTrack(bookingId: string | null | undefined, enabled = true) {
  const query = useQuery({
    queryKey: ['booking-track', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return await bookingApi.trackBooking(bookingId);
    },
    enabled: Boolean(bookingId && enabled),
    refetchInterval: (queryState) => {
      // Auto-poll every 5s if active, or stop polling if terminal state
      const data = queryState.state.data;
      if (!data) return 5000;
      const terminalStates = ['COMPLETED', 'CANCELLED', 'REJECTED', 'RESOLVED', 'REFUNDED'];
      if (terminalStates.includes(data.status)) {
        return false;
      }
      return 5000;
    },
    staleTime: 2000,
    retry: false,
  });

  return {
    trackData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
