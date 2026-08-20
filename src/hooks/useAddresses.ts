import { useQuery } from '@tanstack/react-query';
import { BookingAddress } from '../store/bookingDraft.store';
import { userApi } from '../services/api/user.api';
import { useAuthStore } from '../store/auth.store';
import { isValidUUID } from '../utils/uuid';

export function useAddresses() {
  const token = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: ['user-addresses', token],
    queryFn: async (): Promise<BookingAddress[]> => {
      if (!token) return [];
      try {
        const raw = await userApi.getAddresses();
        if (!raw || !Array.isArray(raw)) return [];
        return raw.map((addr) => ({
          id: isValidUUID(addr.id) ? addr.id : addr.id,
          label: addr.label || 'Home',
          street: addr.address_line,
          city: addr.city || 'Lahore',
          latitude: addr.lat,
          longitude: addr.lng,
          isDefault: Boolean(addr.is_default),
        }));
      } catch (_e) {
        return [];
      }
    },
    staleTime: 30_000,
    retry: 1,
  });

  return {
    addresses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
