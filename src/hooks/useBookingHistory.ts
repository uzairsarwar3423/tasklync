import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';
import { BookingHistoryItem } from '../components/booking/BookingHistoryCard';

export interface BookingHistoryPage {
  bookings: BookingHistoryItem[];
  nextCursor?: string | null;
  hasMore: boolean;
  totalCount: number;
}

const MOCK_HISTORY_BOOKINGS: BookingHistoryItem[] = [
  {
    id: 'b-hist-1',
    booking_number: 'TL-8821',
    worker_id: 'w-1',
    worker_name: 'Muhammad Tariq',
    category: 'Electrician',
    service_title: 'Ceiling Fan Installation & Wiring',
    status: 'COMPLETED',
    total_amount: 1800,
    created_at: '2026-02-14T10:30:00Z',
  },
  {
    id: 'b-hist-2',
    booking_number: 'TL-7910',
    worker_id: 'w-2',
    worker_name: 'Ali Raza',
    category: 'Plumber',
    service_title: 'Bathroom Leakage & Pipe Repair',
    status: 'COMPLETED',
    total_amount: 2500,
    created_at: '2026-01-20T14:15:00Z',
  },
  {
    id: 'b-hist-3',
    booking_number: 'TL-6420',
    worker_id: 'w-3',
    worker_name: 'Shahid Mehmood',
    category: 'AC Repair',
    service_title: 'General AC Servicing & Gas Top-up',
    status: 'COMPLETED',
    total_amount: 4200,
    created_at: '2025-11-05T12:00:00Z',
  },
  {
    id: 'b-hist-4',
    booking_number: 'TL-5219',
    worker_id: 'w-4',
    worker_name: 'Kamran Akmal',
    category: 'Cleaning',
    service_title: 'Deep Home Cleaning Service',
    status: 'CANCELLED',
    total_amount: 5500,
    created_at: '2025-08-12T09:00:00Z',
  },
  {
    id: 'b-hist-5',
    booking_number: 'TL-4102',
    worker_id: 'w-5',
    worker_name: 'Zubair Khan',
    category: 'Painting',
    service_title: 'Master Bedroom Wall Paint',
    status: 'RESOLVED',
    total_amount: 12000,
    created_at: '2025-05-18T16:30:00Z',
  },
];

export function useBookingHistory(year: number | 'all' = 'all', category: string | 'all' = 'all') {
  return useInfiniteQuery<BookingHistoryPage>({
    queryKey: ['booking-history', { year, category }],
    queryFn: async ({ pageParam }): Promise<BookingHistoryPage> => {
      try {
        const response = await apiClient.get<any>('/bookings/history', {
          params: {
            cursor: pageParam || undefined,
            year: year !== 'all' ? year : undefined,
            category: category !== 'all' ? category : undefined,
            limit: 20,
          },
        });

        const data = response.data?.data || response.data;
        if (data && Array.isArray(data.bookings)) {
          return {
            bookings: data.bookings,
            nextCursor: data.next_cursor || null,
            hasMore: Boolean(data.has_more),
            totalCount: data.total_count || data.bookings.length,
          };
        }
      } catch (_err) {
        // Fallback to local filter of past bookings
      }

      // Filter local mock data
      let filtered = [...MOCK_HISTORY_BOOKINGS];
      if (year !== 'all') {
        filtered = filtered.filter((b) => {
          const bYear = new Date(b.created_at).getFullYear();
          return bYear === year;
        });
      }
      if (category !== 'all') {
        filtered = filtered.filter((b) =>
          b.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      return {
        bookings: filtered,
        nextCursor: null,
        hasMore: false,
        totalCount: filtered.length,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
