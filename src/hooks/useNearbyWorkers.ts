import { useQuery } from '@tanstack/react-query';
import { NearbyWorkersParams } from '../types';
import { useLocationStore } from '../store/location.store';
import { workerApi } from '../services/api/worker.api';
import { searchApi } from '../services/api/search.api';

// Target location default fallback (Pakistan coords from working API spec)
const DEFAULT_LAT = 30.8815899;
const DEFAULT_LNG = 72.6281327;
const MAX_ALLOWED_RADIUS = 20000; // Backend constraint: Radius cannot exceed 20,000 meters

export const useNearbyWorkers = (params?: Partial<NearbyWorkersParams>) => {
  const { currentLocation } = useLocationStore();

  const lat = params?.lat ?? currentLocation?.lat ?? DEFAULT_LAT;
  const lng = params?.lng ?? currentLocation?.lng ?? DEFAULT_LNG;
  const radius = Math.min(params?.radius || MAX_ALLOWED_RADIUS, MAX_ALLOWED_RADIUS);

  const queryParams: NearbyWorkersParams = {
    lat,
    lng,
    radius,
    limit: params?.limit || 8,
    ...(params?.category ? { category: params.category } : {}),
  };

  const query = useQuery({
    queryKey: ['workers', 'nearby', queryParams],
    queryFn: async () => {
      if (__DEV__) {
        console.log('[DEBUG nearby-workers] 1. Requesting nearby workers with params:', queryParams);
      }

      // Stage 1: Geofenced Search API (/search/workers) with exact coordinates & radius
      try {
        const searchRes = await searchApi.searchWorkers({
          q: queryParams.category || '',
          lat: queryParams.lat,
          lng: queryParams.lng,
          radius: queryParams.radius,
          limit: queryParams.limit,
        });

        if (__DEV__) {
          console.log('[DEBUG nearby-workers] 2. Stage 1 (Geofenced Search) returned worker count:', searchRes?.workers?.length || 0);
        }

        if (searchRes && Array.isArray(searchRes.workers) && searchRes.workers.length > 0) {
          if (__DEV__) {
            console.log('[DEBUG nearby-workers] 3. Stage 1 SUCCESS. Final data passed to UI component count:', searchRes.workers.length);
          }
          return { workers: searchRes.workers, total: searchRes.total, page: 1, hasMore: searchRes.hasMore };
        }
      } catch (error) {
        console.warn('[useNearbyWorkers] Stage 1 error:', error);
      }

      // Stage 2: Proximity API (/workers/nearby)
      try {
        const res = await workerApi.getNearbyWorkers(queryParams);
        if (__DEV__) {
          console.log('[DEBUG nearby-workers] 4. Stage 2 (Proximity API) returned worker count:', res?.workers?.length || 0);
        }
        if (res && Array.isArray(res.workers) && res.workers.length > 0) {
          if (__DEV__) {
            console.log('[DEBUG nearby-workers] 5. Stage 2 SUCCESS. Final data passed to UI component count:', res.workers.length);
          }
          return res;
        }
      } catch (error) {
        console.warn('[useNearbyWorkers] Stage 2 error:', error);
      }

      // Stage 3: Unbounded Real API Query (Platform-wide Real Worker Discovery)
      // If no worker is registered in strict 20km radius of user's current GPS location,
      // fetch real registered workers from backend database without strict geofencing constraint.
      try {
        if (__DEV__) {
          console.log('[DEBUG nearby-workers] 6. Stage 3: Querying platform-wide real workers from backend database...');
        }
        const fallbackRes = await searchApi.searchWorkers({
          q: queryParams.category || '',
          limit: queryParams.limit,
          category: queryParams.category,
        });

        if (__DEV__) {
          console.log('[DEBUG nearby-workers] 7. Stage 3 (Platform-wide) returned worker count:', fallbackRes?.workers?.length || 0);
        }

        if (fallbackRes && Array.isArray(fallbackRes.workers) && fallbackRes.workers.length > 0) {
          return { workers: fallbackRes.workers, total: fallbackRes.total, page: 1, hasMore: fallbackRes.hasMore };
        }
      } catch (error) {
        console.warn('[useNearbyWorkers] Stage 3 error:', error);
      }

      if (__DEV__) {
        console.log('[DEBUG nearby-workers] 8. All stages complete. Final real data passed to UI: 0 workers in DB.');
      }

      return { workers: [] };
    },
    enabled: true,
    staleTime: 30_000,
    refetchInterval: 60_000,
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
