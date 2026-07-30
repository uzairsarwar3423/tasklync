import { useQuery } from '@tanstack/react-query';
import { NearbyWorkersParams } from '../types';
import { useLocationStore } from '../store/location.store';
import { workerApi } from '../services/api/worker.api';
import { searchApi } from '../services/api/search.api';

export const useNearbyWorkers = (params?: Partial<NearbyWorkersParams>) => {
  const { currentLocation } = useLocationStore();

  const lat = params?.lat ?? currentLocation?.lat;
  const lng = params?.lng ?? currentLocation?.lng;

  const queryParams: NearbyWorkersParams = {
    lat: lat || 0,
    lng: lng || 0,
    radius: params?.radius || 10000,
    limit: params?.limit || 8, // home screen limit
    ...(params?.category ? { category: params.category } : {}),
  };

  const query = useQuery({
    queryKey: ['workers', 'nearby', queryParams],
    queryFn: async () => {
      // Tier 1: Geofenced proximity search for workers nearby
      try {
        const res = await workerApi.getNearbyWorkers(queryParams);
        if (res && Array.isArray(res.workers) && res.workers.length > 0) {
          return res;
        }
      } catch (error) {
        console.warn('[useNearbyWorkers] Proximity API error:', error);
      }

      // Tier 2: Search API fallback with expanded net
      try {
        const searchRes = await searchApi.searchWorkers({
          q: queryParams.category || '',
          lat: queryParams.lat !== 0 ? queryParams.lat : undefined,
          lng: queryParams.lng !== 0 ? queryParams.lng : undefined,
          radius: (queryParams.radius || 10000) * 3, // wider radius search
          limit: queryParams.limit,
        });

        if (searchRes && Array.isArray(searchRes.workers) && searchRes.workers.length > 0) {
          return { workers: searchRes.workers, total: searchRes.total, page: 1, hasMore: searchRes.hasMore };
        }
      } catch (error) {
        console.warn('[useNearbyWorkers] Search API fallback error:', error);
      }

      // Tier 3: Return real empty result if no workers found in backend
      return { workers: [] };
    },
    enabled: true,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 60 seconds
    refetchOnWindowFocus: false,
    select: (data) => data.workers,
  });

  return {
    workers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
