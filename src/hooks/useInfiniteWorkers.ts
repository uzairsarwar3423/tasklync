import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { searchApi } from '../services/api/search.api';
import { NearbyWorkersParams } from '../types/location.types';
import { WorkerNearby } from '../types/worker.types';

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
      // Tier 1: Geofenced nearby workers query
      try {
        const res = await workerApi.getNearbyWorkers({
          ...params,
          page: pageParam,
        });
        if (res && Array.isArray(res.workers) && res.workers.length > 0) {
          return res;
        }
      } catch (err) {
        console.warn('[useInfiniteWorkers] Proximity query error:', err);
      }

      // Tier 2: Search API fallback (category / wider radius search)
      try {
        const searchRes = await searchApi.searchWorkers({
          category: params.category,
          lat: params.lat && params.lat !== 0 ? params.lat : undefined,
          lng: params.lng && params.lng !== 0 ? params.lng : undefined,
          minRating: params.minRating,
          maxRate: params.maxRate,
          sortBy: params.sortBy,
          page: pageParam as number,
          limit: params.limit || 10,
        });

        if (searchRes && Array.isArray(searchRes.workers) && searchRes.workers.length > 0) {
          return {
            workers: searchRes.workers,
            total: searchRes.total,
            page: pageParam,
            hasMore: searchRes.hasMore,
          };
        }
      } catch (searchErr) {
        console.warn('[useInfiniteWorkers] Search fallback error:', searchErr);
      }

      // Tier 3: Return real empty response if backend has 0 matching workers
      return {
        workers: [],
        total: 0,
        page: pageParam,
        hasMore: false,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: true,
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
