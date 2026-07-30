import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { NearbyWorkersParams } from '../types/location.types';
import { WorkerNearby } from '../types/worker.types';

const MOCK_WORKERS: WorkerNearby[] = [
  {
    id: 'w1',
    name: 'Ahmed Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.9,
    totalReviews: 124,
    currency: 'Rs',
    distanceMeters: 1200,
    distanceLabel: '1.2 km',
    categories: ['Electrician', 'AC Repair'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '18:00',
    isOnJob: false,
    responseTimeMins: 5,
    startingPrice: 500,
  },
  {
    id: 'w2',
    name: 'Sarah Ali',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.7,
    totalReviews: 89,
    currency: 'Rs',
    distanceMeters: 2300,
    distanceLabel: '2.3 km',
    categories: ['Cleaning', 'Plumber'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 12,
    startingPrice: 1200,
  },
  {
    id: 'w3',
    name: 'Bilal Malik',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.8,
    totalReviews: 205,
    currency: 'Rs',
    distanceMeters: 3100,
    distanceLabel: '3.1 km',
    categories: ['AC Repair', 'Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 10,
    startingPrice: 800,
  },
  {
    id: 'w4',
    name: 'Zainab Bibi',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.5,
    totalReviews: 42,
    currency: 'Rs',
    distanceMeters: 800,
    distanceLabel: '800 m',
    categories: ['Cleaning'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '20:00',
    isOnJob: false,
    responseTimeMins: 5,
    startingPrice: 600,
  },
  {
    id: 'w5',
    name: 'Tariq Mahmood',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.6,
    totalReviews: 67,
    currency: 'Rs',
    distanceMeters: 1700,
    distanceLabel: '1.7 km',
    categories: ['Plumber', 'Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '17:00',
    isOnJob: false,
    responseTimeMins: 15,
    startingPrice: 700,
  }
];

export const useInfiniteWorkers = (params: Omit<NearbyWorkersParams, 'page'>) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['workers', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await workerApi.getNearbyWorkers({
          ...params,
          page: pageParam,
        });
      } catch (err) {
        const normalizedCategory = params.category?.toLowerCase().replace('_', ' ');
        const filtered = MOCK_WORKERS.filter((w) => {
          if (!normalizedCategory) return true;
          return w.categories.some((c) => c.toLowerCase().includes(normalizedCategory));
        });
        
        let finalWorkers = filtered;
        if (params.minRating && params.minRating > 0) {
          finalWorkers = finalWorkers.filter((w) => w.avgRating >= params.minRating!);
        }
        if (params.maxRate && params.maxRate > 0) {
          finalWorkers = finalWorkers.filter((w) => w.startingPrice !== null && w.startingPrice <= params.maxRate!);
        }

        return {
          workers: finalWorkers,
          total: finalWorkers.length,
          page: pageParam,
          hasMore: false,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: Boolean(params.lat && params.lng),
    staleTime: 30_000,
  });

  const workers = data?.pages.flatMap((page) => page.workers) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const isEmpty = workers.length === 0 && !isLoading;

  useEffect(() => {
    if (workers.length > 0) {
      const top5Workers = workers.slice(0, 5);
      top5Workers.forEach((worker) => {
        queryClient.prefetchQuery({
          queryKey: ['worker', worker.id],
          queryFn: async () => {
            try {
              return await workerApi.getWorkerProfile(worker.id);
            } catch (err) {
              return {
                id: worker.id,
                name: worker.name,
                avatarUrl: worker.avatarUrl,
                avgRating: worker.avgRating,
                totalReviews: worker.totalReviews,
                startingPrice: worker.startingPrice,
                categories: worker.categories,
                availabilityStatus: worker.availabilityStatus,
                bio: 'Professional certified partner with over 5 years of verified field experience.',
                completedJobs: worker.totalReviews + 12,
                experienceYears: 6,
                phone: '+92 300 1234567',
                location: { lat: 24.8607, lng: 67.0011, address: 'Karachi, Pakistan' },
              } as any;
            }
          },
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  }, [workers, queryClient]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    workers,
    total,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    loadMore,
    refetch,
    isEmpty,
  };
};
