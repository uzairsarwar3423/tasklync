import { apiClient } from './client';
import { NearbyWorkersParams, WorkerNearby, WorkerPublicProfile, WorkerReview, WorkerServiceOffering } from '../../types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

export const workerApi = {
  getNearbyWorkers: async (params: NearbyWorkersParams): Promise<{ workers: WorkerNearby[], total: number, page: number, hasMore: boolean }> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<WorkerNearby>>>('/workers/nearby', { params });
    const data = response.data.data;
    return {
      workers: data.items,
      total: response.data.meta?.pagination?.total || 0,
      page: response.data.meta?.pagination?.page || 1,
      hasMore: response.data.meta?.pagination?.hasMore || false,
    };
  },

  getWorkerProfile: async (workerId: string): Promise<WorkerPublicProfile> => {
    const response = await apiClient.get<ApiResponse<WorkerPublicProfile>>(`/workers/${workerId}`);
    return response.data.data;
  },

  getWorkerReviews: async (workerId: string, page: number = 1): Promise<PaginatedResponse<WorkerReview>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<WorkerReview>>>(`/workers/${workerId}/reviews`, { params: { page, limit: 20 } });
    return response.data.data;
  },

  getWorkerPortfolio: async (workerId: string): Promise<Array<{ id: string, imageUrl: string, caption: string | null }>> => {
    const response = await apiClient.get<ApiResponse<Array<{ id: string, imageUrl: string, caption: string | null }>>>(`/workers/${workerId}/portfolio`);
    return response.data.data;
  },

  getWorkerServices: async (workerId: string): Promise<WorkerServiceOffering[]> => {
    const response = await apiClient.get<ApiResponse<WorkerServiceOffering[]>>(`/workers/${workerId}/services`);
    return response.data.data;
  },
};
