import { apiClient } from './client';
import { SearchParams, SearchResult, SearchSuggestion } from '../../types/search.types';
import { ApiResponse } from '../../types/api.types';
import { mapRawWorkerNearby } from '../mappers/worker.mapper';

/**
 * Module 4: Worker Search & Autocomplete Engine
 * Specification Version: 2.0.0
 */
export const searchApi = {
  /**
   * GET /search/workers
   * Full text & faceted worker search
   */
  searchWorkers: async (params: SearchParams): Promise<SearchResult> => {
    try {
      const queryParams: Record<string, any> = {
        q: params.q || '',
        page: params.page || 1,
        limit: params.limit || 20,
      };

      if (params.lat !== undefined && params.lat !== 0) {
        queryParams.lat = params.lat;
      }
      if (params.lng !== undefined && params.lng !== 0) {
        queryParams.lng = params.lng;
        queryParams.radius = params.radius || 5000;
      }
      if (params.category) {
        queryParams.category = params.category;
      }
      if (params.minRating) {
        queryParams.minRating = params.minRating;
      }
      if (params.maxRate) {
        queryParams.maxRate = params.maxRate;
      }
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
      }
      if (params.available) {
        queryParams.available = params.available;
      }

      const response = await apiClient.get<ApiResponse<any>>('/search/workers', {
        params: queryParams,
      });

      const data = response.data?.data;
      const rawWorkers = Array.isArray(data)
        ? data
        : Array.isArray(data?.workers)
        ? data.workers
        : Array.isArray(data?.items)
        ? data.items
        : [];

      const pagination = data?.pagination || response.data?.meta?.pagination;
      const total = pagination?.total || rawWorkers.length;
      const page = pagination?.page || params.page || 1;
      const totalPages = pagination?.totalPages || Math.ceil(total / (params.limit || 20));

      return {
        workers: rawWorkers.map(mapRawWorkerNearby),
        total,
        page,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.warn('searchWorkers API failed, serving client fallback', error);
      return {
        workers: [],
        total: 0,
        page: params.page || 1,
        hasMore: false,
      };
    }
  },

  /**
   * GET /search/autocomplete
   * Instant search suggestions
   */
  getSuggestions: async (query: string, lat?: number, lng?: number): Promise<SearchSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/search/autocomplete', {
        params: { q: query, lat, lng, limit: 10 },
      });
      const data = response.data?.data || [];
      return Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id || item.title || item.name || 'sugg',
            label: item.label || item.title || item.name || item.text || '',
            type: item.type === 'worker' || item.type === 'service' ? item.type : 'category',
            subLabel: item.category_name || item.categoryName || item.subLabel,
          }))
        : [];
    } catch (error) {
      console.warn('getSuggestions API failed', error);
      return [];
    }
  },

  /**
   * GET /search/trending
   * Trending search topics
   */
  getPopularSearches: async (lat?: number, lng?: number): Promise<string[]> => {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>('/search/trending', {
        params: { lat, lng },
      });
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      return ['Electrician', 'AC Repair', 'Plumber', 'Cleaning'];
    } catch (error) {
      return ['Electrician', 'AC Repair', 'Plumber', 'Cleaning'];
    }
  },
};
