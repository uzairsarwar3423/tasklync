import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../services/api/review.api';
import * as Haptics from 'expo-haptics';

export function useSkipReview(bookingId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const skipReview = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    // Optimistically fire dismissal in background
    if (bookingId) {
      reviewApi.dismissPendingReview(bookingId).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    }

    // Navigate back immediately without blocking the user
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/bookings' as any);
    }
  }, [bookingId, queryClient, router]);

  return {
    skipReview,
  };
}
