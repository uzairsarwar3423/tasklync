import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';
import { BlockReason } from '../types/moderation.types';

export interface BlockWorkerParams {
  workerId: string;
  reason?: BlockReason | undefined;
}

export function useBlockWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workerId, reason }: BlockWorkerParams) => {
      const response = await apiClient.post<any>(`/users/me/blocks/${workerId}`, {
        reason,
      });
      return response.data?.data || response.data || { success: true };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all discovery and worker profile caches immediately
      queryClient.invalidateQueries({ queryKey: ['blocked-workers'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-workers'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['search-workers'] });
      queryClient.invalidateQueries({ queryKey: ['worker', variables.workerId] });

    },
  });
}
