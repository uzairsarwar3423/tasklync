import { useQuery } from '@tanstack/react-query';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
    queryFn: async () => {
      // Mock for Day 5 Demo
      return new Promise<ActiveBooking | null>((resolve) => {
        setTimeout(() => {
          resolve(null);
          
          // MOCK DEMO DATA (Uncomment to test the RecentBookingBanner UI):
          /*
          resolve({
            id: 'b1',
            status: 'IN_PROGRESS',
            workerName: 'Ahmed Khan',
            workerAvatarUrl: 'https://i.pravatar.cc/150?u=ahmed',
            scheduledTime: 'Today, 2:00 PM',
            startedAt: new Date().toISOString(),
            distanceLabel: '1.2 km',
            expiresAt: null
          });
          */
        }, 300);
      });
    },
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // 30 seconds
  });
};
