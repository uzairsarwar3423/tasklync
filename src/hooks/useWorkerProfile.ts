import { useQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';

export const useWorkerProfile = (workerId: string) => {
  const query = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => workerApi.getWorkerProfile(workerId),
    enabled: !!workerId,
    staleTime: 300_000, // 5 minutes
  });

  return {
    worker: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useWorkerReviews = (workerId: string, page: number = 1) => {
  const query = useQuery({
    queryKey: ['worker', workerId, 'reviews', page],
    queryFn: () => workerApi.getWorkerReviews(workerId, page),
    enabled: !!workerId,
    staleTime: 300_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
