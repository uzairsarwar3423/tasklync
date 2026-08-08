import { useQuery } from '@tanstack/react-query';
import { BookingAddress } from '../store/bookingDraft.store';
import { userApi } from '../services/api/user.api';
import { useAuthStore } from '../store/auth.store';

const DEFAULT_ADDRESSES: BookingAddress[] = [
  {
    id: 'addr-home-1',
    label: 'Home',
    street: 'House 42, Block C-2, Gulberg III',
    unit: 'Apt 4B',
    city: 'Lahore',
    postalCode: '54000',
    latitude: 31.5204,
    longitude: 74.3587,
    instructions: 'Ring doorbell on the gate',
    isDefault: true,
  },
  {
    id: 'addr-office-1',
    label: 'Office',
    street: 'Floor 4, Haly Tower, Sector R, DHA Phase 5',
    unit: 'Suite 402',
    city: 'Lahore',
    postalCode: '54792',
    latitude: 31.4697,
    longitude: 74.4121,
    instructions: 'Check in with reception on 4th floor',
    isDefault: false,
  },
  {
    id: 'addr-parents-1',
    label: 'Parents House',
    street: 'Street 8, Sector Y, DHA Phase 3',
    city: 'Lahore',
    postalCode: '54792',
    latitude: 31.4789,
    longitude: 74.3721,
    isDefault: false,
  },
];

export function useAddresses() {
  const token = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: ['user-addresses', token],
    queryFn: async () => {
      if (!token) return DEFAULT_ADDRESSES;
      try {
        const raw = await userApi.getAddresses();
        if (!raw || raw.length === 0) return DEFAULT_ADDRESSES;
        return raw.map((addr) => ({
          id: addr.id,
          label: addr.label || 'Home',
          street: addr.address_line,
          city: addr.city || 'Lahore',
          latitude: addr.lat,
          longitude: addr.lng,
          isDefault: Boolean(addr.is_default),
        }));
      } catch (_e) {
        return DEFAULT_ADDRESSES;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  return {
    addresses: query.data || DEFAULT_ADDRESSES,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
