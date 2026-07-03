import { apiClient } from './client';
import { Category, CategoryWithServices, Service } from '../../types/category.types';
import { ApiResponse } from '../../types/api.types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: string): Promise<CategoryWithServices> => {
    const response = await apiClient.get<ApiResponse<CategoryWithServices>>(`/categories/${id}`);
    return response.data.data;
  },

  getCategoryServices: async (categoryId: string): Promise<Service[]> => {
    const response = await apiClient.get<ApiResponse<Service[]>>(`/categories/${categoryId}/services`);
    return response.data.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data;
  },
};
