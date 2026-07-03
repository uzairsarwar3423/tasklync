import { useQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { NearbyWorkersParams } from '../types';
import { useLocationStore } from '../store/location.store';

export const useNearbyWorkers = (params?: Partial<NearbyWorkersParams>) => {
  const { currentLocation } = useLocationStore();

  const lat = params?.lat ?? currentLocation?.lat;
  const lng = params?.lng ?? currentLocation?.lng;

  const queryParams: NearbyWorkersParams | null = (lat !== undefined && lng !== undefined) ? {
    lat: lat as number,
    lng: lng as number,
    radius: params?.radius || 5000,
    limit: params?.limit || 8, // home screen limit
    ...(params?.category ? { category: params.category } : {}),
  } : null;

  const query = useQuery({
    queryKey: ['workers', 'nearby', queryParams],
    queryFn: () => workerApi.getNearbyWorkers(queryParams!),
    enabled: !!queryParams,
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
