import { useQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';

export const useWorkerPortfolio = (workerId: string) => {
  const { data: images = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['worker', workerId, 'portfolio'],
    queryFn: () => workerApi.getWorkerPortfolio(workerId),
    staleTime: 300_000,
  });

  return {
    images,
    isLoading,
    isError,
    refetch,
  };
};
