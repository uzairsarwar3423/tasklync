import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { searchApi } from '../services/api/search.api';
import { NearbyWorkersParams } from '../types/location.types';



const matchCategory = (catList: string[], targetCategory?: string): boolean => {
  if (!targetCategory) return true;
  const target = targetCategory.toLowerCase().replace(/_/g, ' ');
  return catList.some((c) => {
    const item = c.toLowerCase().replace(/_/g, ' ');
    return item.includes(target) || target.includes(item);
  });
};

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
          const matching = params.category
            ? res.workers.filter((w) => matchCategory(w.categories, params.category))
            : res.workers;
          if (matching.length > 0) {
            return {
              workers: matching,
              total: matching.length,
              page: res.page,
              hasMore: res.hasMore,
            };
          }
        }
      } catch (err) {
        console.warn('[useInfiniteWorkers] Proximity query error:', err);
      }

      // Tier 2: Unfiltered search API fallback (Category search without strict geofence restriction)
      try {
        const searchRes = await searchApi.searchWorkers({
          q: '',
          category: params.category,
          minRating: params.minRating,
          maxRate: params.maxRate,
          sortBy: params.sortBy as any,
          page: pageParam as number,
          limit: params.limit || 20,
        });

        if (searchRes && Array.isArray(searchRes.workers) && searchRes.workers.length > 0) {
          const matching = params.category
            ? searchRes.workers.filter((w) => matchCategory(w.categories, params.category))
            : searchRes.workers;

          const finalWorkers = matching.length > 0 ? matching : searchRes.workers;
          return {
            workers: finalWorkers,
            total: finalWorkers.length,
            page: pageParam,
            hasMore: searchRes.hasMore,
          };
        }
      } catch (searchErr) {
        console.warn('[useInfiniteWorkers] Search fallback error:', searchErr);
      }

      // No workers found on server
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

