import { useQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { NearbyWorkersParams } from '../types';
import { useLocationStore } from '../store/location.store';

const MOCK_WORKERS = [
  {
    id: 'w1',
    name: 'Ahmed Khan',
    avatarUrl: 'https://png.pngtree.com/png-clipart/20231020/original/pngtree-power-lineman-electrician-png-image_13377739.png',
    avgRating: 4.9,
    totalReviews: 124,
    currency: 'Rs',
    distanceMeters: 1200,
    distanceLabel: '1.2 km',
    categories: ['Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '18:00',
    isOnJob: false,
    responseTimeMins: 5,
    startingPrice: 500,
  },
  {
    id: 'w2',
    name: 'Sarah Ali',
    avatarUrl: 'https://img.magnific.com/free-photo/workwoman-office-cleaning-service_1398-3766.jpg?semt=ais_hybrid&w=740&q=80',
    avgRating: 4.7,
    totalReviews: 89,
    currency: 'Rs',
    distanceMeters: 2300,
    distanceLabel: '2.3 km',
    categories: ['Cleaning', 'Plumber'],
    availabilityStatus: 'BUSY',
    availableUntil: null,
    isOnJob: true,
    responseTimeMins: 15,
    startingPrice: 1200,
  },
  {
    id: 'w3',
    name: 'Bilal Malik',
    avatarUrl: 'https://i.pravatar.cc/150?u=bilal',
    avgRating: 4.8,
    totalReviews: 205,
    currency: 'Rs',
    distanceMeters: 3100,
    distanceLabel: '3.1 km',
    categories: ['AC Repair'],
    availabilityStatus: 'OFFLINE',
    availableUntil: null,
    isOnJob: false,
    responseTimeMins: 30,
    startingPrice: 800,
  },
  {
    id: 'w4',
    name: 'Zainab B.',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvpweDIYeUmAx7d5Tdr64qREp6Pjc5UmBzhht2oPa-Tw&s',
    avgRating: 5.0,
    totalReviews: 42,
    currency: 'Rs',
    distanceMeters: 800,
    distanceLabel: '800 m',
    categories: ['Painter'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '20:00',
    isOnJob: false,
    responseTimeMins: 2,
    startingPrice: 1500,
  },
];

export const useNearbyWorkers = (params?: Partial<NearbyWorkersParams>) => {
  const { currentLocation } = useLocationStore();

  // Fallback to 0 if location not yet loaded so we always get queryParams to show demo data
  const lat = params?.lat ?? currentLocation?.lat ?? 31.5204;
  const lng = params?.lng ?? currentLocation?.lng ?? 74.3587;

  const queryParams: NearbyWorkersParams | null = (lat !== undefined && lng !== undefined) ? {
    lat: lat as number,
    lng: lng as number,
    radius: params?.radius || 5000,
    limit: params?.limit || 8, // home screen limit
    ...(params?.category ? { category: params.category } : {}),
  } : null;

  const query = useQuery({
    queryKey: ['workers', 'nearby', queryParams],
    queryFn: async () => {
      // Mock API delay for Day 5 demonstration
      return new Promise<{ workers: any[] }>((resolve) => {
        setTimeout(() => resolve({ workers: MOCK_WORKERS }), 800);
      });
      // Real API implementation (commented for demo):
      // return workerApi.getNearbyWorkers(queryParams!);
    },
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
