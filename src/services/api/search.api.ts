import { apiClient } from './client';
import { SearchParams, SearchResult, SearchSuggestion } from '../../types/search.types';
import { ApiResponse } from '../../types/api.types';
import { mapRawWorkerNearby, extractRawWorkerList, extractPaginationMeta } from '../mappers/worker.mapper';

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
        page: params.page || 1,
        limit: params.limit || 20,
      };

      if (params.q && params.q.trim().length > 0) {
        queryParams.q = params.q.trim();
      }

      if (params.lat !== undefined && params.lat !== 0) {
        queryParams.lat = params.lat;
      }
      if (params.lng !== undefined && params.lng !== 0) {
        queryParams.lng = params.lng;
      }
      if (params.radius !== undefined) {
        queryParams.radius = Math.min(params.radius, 20000);
      } else if (params.lat !== undefined && params.lng !== undefined) {
        queryParams.radius = 20000;
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

      if (__DEV__) {
        console.log('[DEBUG nearby-workers] GET /search/workers queryParams:', queryParams);
      }

      const response = await apiClient.get<ApiResponse<any>>('/search/workers', {
        params: queryParams,
      });

      if (__DEV__) {
        console.log('[DEBUG nearby-workers] GET /search/workers raw response status:', response.status, 'data:', response.data);
      }

      const rawWorkers = extractRawWorkerList(response.data);
      const meta = extractPaginationMeta(response.data, rawWorkers.length, params.page || 1, params.limit || 20);

      const transformedWorkers = rawWorkers.map(mapRawWorkerNearby);

      if (__DEV__) {
        console.log('[DEBUG nearby-workers] Worker array length:', rawWorkers.length, 'Transformed count:', transformedWorkers.length);
        console.log('[DEBUG nearby-workers] Worker objects after transformation:', transformedWorkers);
      }

      return {
        workers: transformedWorkers,
        total: meta.total,
        page: meta.page,
        hasMore: meta.hasMore,
      };
    } catch (error) {
      console.warn('[DEBUG nearby-workers] searchWorkers API error:', error);
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
