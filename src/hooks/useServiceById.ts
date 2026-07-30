import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../services/api/category.api';
import { Service } from '../types/category.types';
import { MOCK_CATEGORY_DETAILS } from './useCategories';

export const useServiceById = (serviceId: string) => {
  const { data, isLoading, isError, refetch } = useQuery<Service, Error>({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      try {
        return await categoryApi.getServiceById(serviceId);
      } catch (err) {
        for (const catId of Object.keys(MOCK_CATEGORY_DETAILS)) {
          const service = MOCK_CATEGORY_DETAILS[catId].services.find((s) => s.id === serviceId);
          if (service) return service;
        }
        throw err;
      }
    },
    staleTime: 3600_000, // 1 hour stale time as services change rarely
    enabled: Boolean(serviceId),
  });

  return {
    service: data,
    isLoading,
    isError,
    refetch,
  };
};
