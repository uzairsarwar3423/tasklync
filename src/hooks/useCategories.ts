import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../services/api/category.api';
import { Category } from '../types';

const MOCK_CATEGORIES: Category[] = [
  { id: 'electrician', name: 'Electrician', nameUr: 'الیکٹریشن', iconUrl: null, parentId: null, isActive: true, sortOrder: 1 },
  { id: 'plumber', name: 'Plumber', nameUr: 'پلمبر', iconUrl: null, parentId: null, isActive: true, sortOrder: 2 },
  { id: 'ac_repair', name: 'AC Repair', nameUr: 'اے سی مرمت', iconUrl: null, parentId: null, isActive: true, sortOrder: 3 },
  { id: 'cleaning', name: 'Cleaning', nameUr: 'صفائی', iconUrl: null, parentId: null, isActive: true, sortOrder: 4 },
  { id: 'carpenter', name: 'Carpenter', nameUr: 'بڑھئی', iconUrl: null, parentId: null, isActive: true, sortOrder: 5 },
  { id: 'painter', name: 'Painter', nameUr: 'پینٹر', iconUrl: null, parentId: null, isActive: true, sortOrder: 6 },
];

export const useCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await categoryApi.getCategories();
        return data.length ? data : MOCK_CATEGORIES;
      } catch (err) {
        return MOCK_CATEGORIES;
      }
    },
    staleTime: 3600_000, // 1 hour
    gcTime: 86400_000, // 24 hours
    refetchOnMount: false,
  });

  return {
    categories: query.data || MOCK_CATEGORIES,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCategoryById = (id: string) => {
  const query = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getCategoryById(id),
    staleTime: 3600_000,
    enabled: !!id,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useCategoryServices = (categoryId: string) => {
  const query = useQuery({
    queryKey: ['services', categoryId],
    queryFn: () => categoryApi.getCategoryServices(categoryId),
    staleTime: 3600_000,
    enabled: !!categoryId,
  });

  return {
    services: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
