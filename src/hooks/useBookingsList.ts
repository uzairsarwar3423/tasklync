import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';
import { ListBookingsParams, ListBookingsResponse } from '../types/booking.types';
import { useAuthStore } from '../store/auth.store';

export function useBookingsList(params?: ListBookingsParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const authState = useAuthStore((s) => s.authState);

  const queryKey = ['bookings-list', params?.status || 'ALL', params?.page || 1, params?.limit || 20, accessToken];

  const isAuthenticated = Boolean(accessToken && authState === 'authenticated');

  const query = useQuery<ListBookingsResponse, Error>({
    queryKey,
    queryFn: async () => {
      return await bookingApi.listBookings(params);
    },
    enabled: isAuthenticated,
    staleTime: 15_000,
    retry: false,
  });

  return {
    bookings: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: isAuthenticated ? query.isLoading : false,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    isAuthenticated,
  };
}
