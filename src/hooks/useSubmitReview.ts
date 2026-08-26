import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../services/api/review.api';
import { ReviewSubmitPayload, WorkerReview } from '../types/review.types';
import * as Haptics from 'expo-haptics';

export function useSubmitReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation<WorkerReview, Error, ReviewSubmitPayload>({
    mutationFn: async (payload: ReviewSubmitPayload) => {
      return reviewApi.submitReview(payload);
    },
    onSuccess: (_data, variables) => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}

      // 1. Invalidate worker queries so avg_rating & review list re-fetch
      if (variables.targetId) {
        queryClient.invalidateQueries({ queryKey: ['worker', variables.targetId] });
        queryClient.invalidateQueries({ queryKey: ['worker-profile', variables.targetId] });
        queryClient.invalidateQueries({ queryKey: ['worker-reviews', variables.targetId] });
      }

      // 2. Invalidate booking queries so "Rate now" prompt drops from booking card
      if (variables.bookingId) {
        queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }

      // 3. Invalidate pending reviews cache
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  return {
    submitReview: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
