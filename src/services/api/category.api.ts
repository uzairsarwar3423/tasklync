import { apiClient } from './client';
import { Category, CategoryWithServices, Service } from '../../types/category.types';
import { ApiResponse } from '../../types/api.types';
import { mapRawCategory, mapRawService } from '../mappers/category.mapper';

/**
 * Module 1 & 2: Service Categories Catalog & Master Service Details
 * Specification Version: 2.0.0
 */
export const categoryApi = {
  /**
   * GET /categories?activeOnly=true
   * List active top-level categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/categories', {
      params: { activeOnly: true },
    });
    const rawData = response.data?.data || [];
    return Array.isArray(rawData) ? rawData.map(mapRawCategory) : [];
  },

  /**
   * GET /categories/:id
   * Get single category details
   */
  getCategoryById: async (id: string): Promise<CategoryWithServices> => {
    const response = await apiClient.get<ApiResponse<any>>(`/categories/${id}`);
    const rawData = response.data?.data || {};
    const category = mapRawCategory(rawData);
    const services = Array.isArray(rawData.services)
      ? rawData.services.map(mapRawService)
      : [];

    return {
      ...category,
      services,
    };
  },

  /**
   * GET /categories/:id/services
   * Get predefined sub-services belonging to a category
   */
  getCategoryServices: async (categoryId: string): Promise<Service[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/categories/${categoryId}/services`);
    const rawData = response.data?.data || [];
    return Array.isArray(rawData) ? rawData.map(mapRawService) : [];
  },

  /**
   * GET /services/:id
   * Master service details lookup by UUID
   */
  getServiceById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<any>>(`/services/${id}`);
    return mapRawService(response.data?.data);
  },
};
