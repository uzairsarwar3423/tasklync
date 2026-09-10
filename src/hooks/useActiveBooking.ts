import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';
import { BookingStatus } from '../types/booking.types';
import { formatPKTRelativeSchedule } from '../utils/timezone';

export interface ActiveBooking {
  id: string;
  status: BookingStatus;
  workerName: string;
  workerAvatarUrl: string | null;
  scheduledTime: string | null;
  startedAt: string | null;
  distanceLabel: string | null;
  expiresAt: string | null;
}

export const useActiveBooking = () => {
  return useQuery({
    queryKey: ['active-booking'],
    queryFn: async (): Promise<ActiveBooking | null> => {
      try {
        const response = await bookingApi.listBookings({ page: 1, limit: 10 });
        const items = response.data || [];
        const activeStatuses: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED_BY_WORKER'];
        const active = items.find(
          (item) =>
            activeStatuses.includes(item.status as BookingStatus) &&
            item.id &&
            !item.id.startsWith('b-') &&
            !item.id.startsWith('TL-')
        );

        if (!active) {
          return null;
        }

        return {
          id: active.id,
          status: active.status,
          workerName: active.worker_name || 'Assigned Professional',
          workerAvatarUrl: active.worker_avatar_url || null,
          scheduledTime: formatPKTRelativeSchedule(active.scheduled_at),
          startedAt: active.started_at || null,
          distanceLabel: '1.2 km',
          expiresAt: active.expires_at || null,
        };
      } catch (_e) {
        return null;
      }
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
};
