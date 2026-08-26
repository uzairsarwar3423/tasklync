import { useState, useCallback, useMemo } from 'react';
import { ReviewCategoryKey, ReviewFormState } from '../types/review.types';
import * as Haptics from 'expo-haptics';

const INITIAL_CATEGORY_RATINGS: Record<ReviewCategoryKey, number> = {
  punctuality: 0,
  quality: 0,
  communication: 0,
  value: 0,
};

export interface UseReviewFormStateReturn extends ReviewFormState {
  setOverallRating: (rating: number) => void;
  setCategoryRating: (category: ReviewCategoryKey, rating: number) => void;
  setComment: (comment: string) => void;
  reset: () => void;
}

/**
 * useReviewFormState Hook
 *
 * Isolated, pure form-state machine for the review flow:
 * - Solves 2 independent required-ness rules: overall rating is hard-required, categories are soft-optional.
 * - Exposes derived `canSubmit` (overallRating > 0) and `shouldShowCategorySection` (overallRating > 0).
 * - Preserves user input across retry attempts without premature resets.
 */
export function useReviewFormState(): UseReviewFormStateReturn {
  const [overallRating, setOverallRatingInternal] = useState<number>(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<ReviewCategoryKey, number>>(
    INITIAL_CATEGORY_RATINGS
  );
  const [comment, setComment] = useState<string>('');

  const setOverallRating = useCallback((rating: number) => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    setOverallRatingInternal(rating);
  }, []);

  const setCategoryRating = useCallback((category: ReviewCategoryKey, rating: number) => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    setCategoryRatings((prev) => ({
      ...prev,
      [category]: rating,
    }));
  }, []);

  const reset = useCallback(() => {
    setOverallRatingInternal(0);
    setCategoryRatings(INITIAL_CATEGORY_RATINGS);
    setComment('');
  }, []);

  const canSubmit = useMemo(() => overallRating > 0, [overallRating]);
  const shouldShowCategorySection = useMemo(() => overallRating > 0, [overallRating]);

  return {
    overallRating,
    categoryRatings,
    comment,
    canSubmit,
    shouldShowCategorySection,
    setOverallRating,
    setCategoryRating,
    setComment,
    reset,
  };
}
