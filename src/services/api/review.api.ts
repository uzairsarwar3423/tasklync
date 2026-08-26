import { apiClient } from './client';
import {
  ReviewSubmitPayload,
  WorkerReview,
  PendingReviewItem,
  ReviewSummaryData,
} from '../../types/review.types';

export const reviewApi = {
  /**
   * Submit a post-booking customer review
   * POST /api/v1/reviews
   */
  submitReview: async (payload: ReviewSubmitPayload): Promise<WorkerReview> => {
    const formattedCategories: Record<string, number> = {};
    if (payload.categories) {
      if (payload.categories.punctuality && payload.categories.punctuality > 0) {
        formattedCategories.punctuality = payload.categories.punctuality;
      }
      if (payload.categories.quality && payload.categories.quality > 0) {
        formattedCategories.quality = payload.categories.quality;
      }
      if (payload.categories.communication && payload.categories.communication > 0) {
        formattedCategories.communication = payload.categories.communication;
      }
      if (payload.categories.value && payload.categories.value > 0) {
        formattedCategories.value = payload.categories.value;
      }
    }

    const requestBody = {
      booking_id: payload.bookingId,
      target_id: payload.targetId,
      target_type: payload.targetType || 'worker',
      rating: payload.rating,
      categories: Object.keys(formattedCategories).length > 0 ? formattedCategories : undefined,
      comment: payload.comment?.trim() || undefined,
    };

    const response = await apiClient.post<any>('/reviews', requestBody);
    return response.data?.data || response.data;
  },

  /**
   * Fetch pending reviews awaiting customer rating
   * GET /api/v1/reviews/pending
   */
  getPendingReviews: async (): Promise<PendingReviewItem[]> => {
    try {
      const response = await apiClient.get<any>('/reviews/pending');
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * Dismiss a pending review prompt/reminder
   * POST /api/v1/reviews/pending/:bookingId/dismiss
   */
  dismissPendingReview: async (bookingId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/reviews/pending/${bookingId}/dismiss`);
      return true;
    } catch {
      try {
        await apiClient.patch(`/reviews/pending/${bookingId}/dismiss`);
        return true;
      } catch {
        // Safe fallback for client-side dismissal
        return true;
      }
    }
  },

  /**
   * Fetch reviews for a specific worker
   * GET /api/v1/workers/:workerId/reviews
   */
  getWorkerReviews: async (
    workerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: WorkerReview[]; summary?: ReviewSummaryData }> => {
    try {
      const response = await apiClient.get<any>(`/workers/${workerId}/reviews`, {
        params: { page, limit },
      });
      const data = response.data?.data || response.data || {};
      return {
        reviews: Array.isArray(data.reviews) ? data.reviews : Array.isArray(data) ? data : [],
        summary: data.summary,
      };
    } catch {
      return { reviews: [] };
    }
  },
};
